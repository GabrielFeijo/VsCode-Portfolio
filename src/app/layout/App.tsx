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
	useState,
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
import { isBrowser, isMobile } from 'react-device-detect';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import i18n from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { pageRoutes } from '../pages/pages';
import { useTranslation } from 'react-i18next';
import {
	sidebarAnimations,
	sidebarItemAnimations,
	slideInOut,
	slideUpDown,
} from '../../utils/motionVariants';
import { StorageService } from '../../services/storageService';
import { Language, Page } from '../../domain/page';
import MetadataComponent from './Metadata';
import { createAppTheme } from '../theme/createAppTheme';
import { useAppKeyboardShortcuts } from '../hooks/useAppKeyboardShortcuts';
import {
	getLanguageFromPathname,
	getLocalizedPath,
} from '../../config/seo';

const BoxRating = lazy(() => import('../components/Rating/BoxRating'));
const MDContainer = lazy(() => import('../components/MDContainer'));
const Terminal = lazy(() => import('./Terminal'));

export function initVisiblePageIndexes(pages: Page[]) {
	return pages.map(({ index }) => index);
}

function loadPages(language: Language): Page[] {
	return [...pageRoutes[language], ...StorageService.getData()];
}

export default function App() {
	const { pathname } = useLocation();
	const language = getLanguageFromPathname(pathname);
	const { theme: paletteType, toggleTheme } = useTheme();
	const { t } = useTranslation();
	const isDarkMode = paletteType === 'dark';

	const [pages, setPages] = useState<Page[]>(() => loadPages(language));
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(isBrowser);
	const [terminal, setTerminal] = useState(isBrowser && !isMobile);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);
	const [currentComponent, setCurrentComponent] = useState('');
	const [visiblePageIndexes, setVisiblePageIndexes] = useState(
		initVisiblePageIndexes(pages)
	);
	const [ranking, setRanking] = useState(false);

	const theme = useMemo(
		() => createAppTheme(paletteType),
		[paletteType]
	);

	const changeLanguage = useCallback(() => {
		const newLanguage = language === 'pt' ? 'en' : 'pt';
		void i18n.changeLanguage(newLanguage);
		navigate(getLocalizedPath(pathname, newLanguage));
	}, [language, navigate, pathname]);

	useEffect(() => {
		setPages(loadPages(language));

		if (!i18n.language.toLowerCase().startsWith(language)) {
			void i18n.changeLanguage(language);
		}
	}, [language]);

	const visiblePages = useMemo(
		() =>
			visiblePageIndexes
				.map((index) => pages.find((page) => page.index === index))
				.filter((page): page is Page => page !== undefined),
		[pages, visiblePageIndexes]
	);

	useEffect(() => {
		if (visiblePageIndexes.length === 0) {
			setSelectedIndex(-1);
			navigate(getLocalizedPath('/', language));
			return;
		}

		if (selectedIndex !== -1 && !visiblePageIndexes.includes(selectedIndex)) {
			const maxIndex = Math.max(...visiblePageIndexes);
			const minIndex = Math.min(...visiblePageIndexes);

			const newIndex = selectedIndex > maxIndex ? maxIndex : minIndex;
			setSelectedIndex(newIndex);

			const page = pages.find((x) => x.index === newIndex);
			if (page) navigate(getLocalizedPath(`/${page.route}`, language));
		}
	}, [language, navigate, pages, selectedIndex, visiblePageIndexes]);

	const navigateHome = useCallback(
		() => navigate(getLocalizedPath('/', language)),
		[language, navigate]
	);
	const toggleExplorer = useCallback(() => setExpanded((value) => !value), []);
	const toggleTerminal = useCallback(() => setTerminal((value) => !value), []);

	useAppKeyboardShortcuts({
		changeLanguage,
		navigateHome,
		terminalEnabled: !isMobile,
		toggleExplorer,
		toggleTerminal,
		toggleTheme,
	});

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
				<ThemeProvider theme={theme}>
					<CssBaseline enableColorScheme />
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
								sx={{ height: 'calc(100% - 20px)', overflow: 'hidden' }}
							>
								<Grid
									item
									sx={{
										width: 50,
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
											setExpanded={setExpanded}
											expanded={expanded}
											terminal={terminal}
											setTerminal={setTerminal}
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
												left: isMobile ? 50 : 0,
												top: 0,
												height: isMobile
													? 'calc(var(--app-viewport-height) - 20px)'
													: '100%',
												zIndex: isMobile ? 999 : 'auto',
												boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.2)' : 'none',
											}}
										>
											<Grid
												item
												sx={{
													backgroundColor: isDarkMode ? '#21222c' : '#f3f3f3',
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
														<AppTree
															pages={pages}
															setPages={setPages}
															selectedIndex={selectedIndex}
															setSelectedIndex={setSelectedIndex}
															currentComponent={currentComponent}
															setCurrentComponent={setCurrentComponent}
															visiblePageIndexes={visiblePageIndexes}
															setVisiblePageIndexes={setVisiblePageIndexes}
															language={language}
														/>
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
											backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
									<Grid
										sx={{
											height: '33px',
										}}
									>
										<AppButtons
											language={language}
											pages={visiblePages}
											selectedIndex={selectedIndex}
											setSelectedIndex={setSelectedIndex}
											currentComponent={currentComponent}
											setCurrentComponent={setCurrentComponent}
											visiblePageIndexes={visiblePageIndexes}
											setVisiblePageIndexes={setVisiblePageIndexes}
										/>
									</Grid>

									<motion.div
										initial={false}
										animate={{
											height: `calc(100% - 33px - ${terminal && !isMobile ? '300px' : '0px'
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

					<AnimatePresence>
						{terminal && !isMobile && (
							<Grid
								sx={{
									scrollBehavior: 'smooth',
									minHeight: '300px',
									overflow: 'hidden',
									position: 'absolute',
									width: `calc(100% - 50px - ${expanded ? '220px' : '0px'})`,
									bottom: 20,
									right: 0,
								}}
							>
								<motion.div
									initial={false}
									animate={{
										width: `calc(100% - 50px - ${expanded ? '220px' : '0px'})`,
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
												selectedTerminalIndex={selectedTerminalIndex}
												setSelectedTerminalIndex={setSelectedTerminalIndex}
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
				</ThemeProvider>
			)}
		</>
	);
}
