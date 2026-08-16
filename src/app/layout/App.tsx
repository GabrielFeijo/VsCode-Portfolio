import {
	Box,
	Container,
	CssBaseline,
	Grid,
	Stack,
	ThemeProvider,
	Typography,
} from '@mui/material';
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import AppTree from './AppTree';
import Footer from './Footer';
import Sidebar from './Sidebar';
import {
	Routes,
	Route,
	useLocation,
	useNavigate,
	Navigate,
} from 'react-router-dom';
import AppButtons from './AppButtons';
import Home from '../pages/Home';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import i18n from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
	sidebarAnimations,
	sidebarItemAnimations,
	slideInOut,
	slideUpDown,
} from '../../utils/motionVariants';
import MetadataComponent from './Metadata';
import { createAppTheme } from '../theme/createAppTheme';
import { useAppPalette } from '../theme/useAppPalette';
import { useAppKeyboardShortcuts } from '../hooks/useAppKeyboardShortcuts';
import {
	getLanguageFromPathname,
	getLocalizedPath,
} from '../../config/seo';
import { EditorProvider, useEditorContext } from '../../contexts/EditorContext';
import { LayoutProvider, useLayoutContext } from '../../contexts/LayoutContext';
import { LAYOUT } from '../../constants/layout';

// Re-export for backward compatibility with existing tests
export { loadPages, initVisiblePageIndexes } from '../../contexts/EditorContext';

const BoxRating = lazy(() => import('../components/Rating/BoxRating'));
const MDContainer = lazy(() => import('../components/MDContainer'));
const Terminal = lazy(() => import('./Terminal'));

interface AppContentProps {
	changeLanguage: () => void;
}

function AppContent({ changeLanguage }: AppContentProps) {
	const { t } = useTranslation();
	const colors = useAppPalette();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const language = getLanguageFromPathname(pathname);

	const {
		pages,
		setPages,
		setSelectedIndex,
		openTabByTarget,
	} = useEditorContext();

	const {
		expanded,
		setExpanded,
		terminal,
		setTerminal,
		ranking,
		setRanking,
		toggleExplorer,
		toggleTerminal,
	} = useLayoutContext();

	const { toggleTheme } = useTheme();

	const navigateHome = useCallback(
		() => navigate(getLocalizedPath('/', language)),
		[language, navigate],
	);

	useAppKeyboardShortcuts({
		changeLanguage,
		navigateHome,
		terminalEnabled: !isMobile,
		toggleExplorer,
		toggleTerminal,
		toggleTheme,
	});

	// Delegate the legacy open-tab window event to the context method
	useEffect(() => {
		const handleOpenTab = (event: Event) => {
			const customEvent = event as CustomEvent<{ target?: string }>;
			const target = customEvent.detail?.target;
			if (target !== undefined) {
				openTabByTarget(target);
			}
		};

		window.addEventListener('open-tab', handleOpenTab);
		return () => window.removeEventListener('open-tab', handleOpenTab);
	}, [openTabByTarget]);

	return (
		<>
			<MetadataComponent />
			{ranking && (
				<Suspense fallback={null}>
					<BoxRating
						ranking={ranking}
						setRanking={setRanking}
					/>
				</Suspense>
			)}
			<KeyboardShortcutsModal visible={true} />
			{language && (
				<Container
					sx={{
						m: 0,
						p: 0,
						width: '100%',
						height: 'var(--app-viewport-height)',
						maxHeight: 'var(--app-viewport-height)',
						overflow: 'hidden',
					}}
					maxWidth={false}
					disableGutters
				>
					<Grid
						container
						sx={{ height: '100%', overflow: 'hidden' }}
					>
						<Grid
							container
							sx={{ height: `calc(100% - ${LAYOUT.FOOTER_HEIGHT}px)`, overflow: 'hidden' }}
						>
							<Grid
								item
								sx={{
									width: LAYOUT.SIDEBAR_WIDTH,
									height: '100%',
									zIndex: isMobile ? 1000 : 2,
								}}
							>
								<motion.div
									variants={slideInOut}
									initial='initial'
									animate='animate'
									exit='exit'
									style={{ height: '100%' }}
								>
									<Sidebar
										language={language}
										changeLanguage={changeLanguage}
									/>
								</motion.div>
							</Grid>
							<AnimatePresence mode='wait'>
								{expanded && (
									<motion.div
										variants={sidebarAnimations}
										initial='initial'
										animate='animate'
										exit='exit'
										layout='position'
										style={{
											position: isMobile ? 'fixed' : 'relative',
											left: isMobile ? LAYOUT.SIDEBAR_WIDTH : 0,
											top: 0,
											height: isMobile
												? `calc(var(--app-viewport-height) - ${LAYOUT.FOOTER_HEIGHT}px)`
												: '100%',
											zIndex: isMobile ? 999 : 'auto',
											boxShadow: isMobile
												? '2px 0 8px rgba(0,0,0,0.2)'
												: 'none',
										}}
									>
										<Grid
											item
											sx={{
												backgroundColor: colors.bgExplorer,
												height: '100%',
												minHeight: 0,
											}}
										>
											<Stack>
												<motion.div variants={sidebarItemAnimations}>
													<Typography
														variant='caption'
														color='text.secondary'
														sx={{ ml: 4 }}
													>
														{t('sidebar.explorer')}
													</Typography>
												</motion.div>
												<motion.div variants={sidebarItemAnimations}>
													<AppTree language={language} />
												</motion.div>
											</Stack>
										</Grid>
									</motion.div>
								)}
							</AnimatePresence>
							{isMobile && expanded && (
								<Box
									data-testid="sidebar-overlay"
									sx={{
										position: 'fixed',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										backgroundColor: colors.bgOverlay,
										zIndex: 998,
									}}
									onClick={() => setExpanded(false)}
								/>
							)}
							<Grid
								item
								xs
								zeroMinWidth
								sx={{
									width: '100%',
									maxWidth: '100%',
									height: '100%',
									minHeight: 0,
									overflow: 'hidden',
								}}
							>
								<Grid sx={{ height: `${LAYOUT.TABS_HEIGHT}px` }}>
									<AppButtons language={language} />
								</Grid>

								<motion.div
									initial={false}
									animate={{
										height: `calc(100% - ${LAYOUT.TABS_HEIGHT}px - ${terminal && !isMobile ? `${LAYOUT.TERMINAL_MIN_HEIGHT}px` : '0px'
											})`,
									}}
									transition={{
										type: 'spring',
										damping: 30,
										stiffness: 200,
										bounce: 0.2,
									}}
									style={{
										overflowY: 'auto',
										scrollBehavior: 'smooth',
									}}
									role="main"
									aria-label="Main content"
								>
									<Routes>
										<Route
											path={getLocalizedPath('/', language)}
											element={<Home setSelectedIndex={setSelectedIndex} />}
										/>
										{pages.map(({ index, name, route }) => (
											<Route
												key={index}
												path={getLocalizedPath(`/${route}`, language)}
												element={
													<Suspense fallback={null}>
														<MDContainer
															path={`/pages/${language.toLowerCase()}/${name}`}
															page={pages.find((p) => p.index === index)}
															setPages={setPages}
														/>
													</Suspense>
												}
											/>
										))}
										<Route
											path='*'
											element={
												<Navigate
													to={getLocalizedPath('/', language)}
													replace
												/>
											}
										/>
									</Routes>
								</motion.div>
							</Grid>
						</Grid>

						<Grid
							item
							lg={12}
							md={12}
							sm={12}
							xs={12}
							zIndex={2}
						>
							<Footer />
						</Grid>
					</Grid>
				</Container>
			)}

			<AnimatePresence>
				{terminal && !isMobile && (
					<Grid
						sx={{
							scrollBehavior: 'smooth',
							minHeight: `${LAYOUT.TERMINAL_MIN_HEIGHT}px`,
							overflow: 'hidden',
							position: 'absolute',
							width: `calc(100% - ${LAYOUT.SIDEBAR_WIDTH}px - ${expanded ? `${LAYOUT.EXPLORER_WIDTH}px` : '0px'})`,
							bottom: LAYOUT.FOOTER_HEIGHT,
							right: 0,
						}}
					>
						<motion.div
							initial={false}
							animate={{
								width: `calc(100% - ${LAYOUT.SIDEBAR_WIDTH}px - ${expanded ? `${LAYOUT.EXPLORER_WIDTH}px` : '0px'})`,
							}}
							transition={{
								type: 'spring',
								damping: 30,
								stiffness: 200,
								bounce: 0.2,
							}}
							style={{
								position: 'fixed',
								right: 0,
							}}
						>
							<motion.div
								variants={slideUpDown}
								initial='initial'
								animate='animate'
								exit='exit'
							>
								<Suspense fallback={null}>
									<Terminal
										language={language}
										setTerminal={setTerminal}
										setRanking={setRanking}
										changeLanguage={changeLanguage}
									/>
								</Suspense>
							</motion.div>
						</motion.div>
					</Grid>
				)}
			</AnimatePresence>
		</>
	);
}

export default function App() {
	const { pathname } = useLocation();
	const language = getLanguageFromPathname(pathname);
	const { theme: paletteType } = useTheme();
	const navigate = useNavigate();

	const muiTheme = useMemo(() => createAppTheme(paletteType), [paletteType]);

	const changeLanguage = useCallback(() => {
		const newLanguage = language === 'pt' ? 'en' : 'pt';
		void i18n.changeLanguage(newLanguage);
		navigate(getLocalizedPath(pathname, newLanguage));
	}, [language, navigate, pathname]);

	return (
		<ThemeProvider theme={muiTheme}>
			<CssBaseline enableColorScheme />
			<LayoutProvider>
				<EditorProvider language={language}>
					<AppContent changeLanguage={changeLanguage} />
				</EditorProvider>
			</LayoutProvider>
		</ThemeProvider>
	);
}
