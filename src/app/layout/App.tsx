import { Box, Container, CssBaseline, Grid, Stack, ThemeProvider, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useHomeQuery } from '@/hooks/queries/useHomeQuery';
import { getLanguageFromPathname, getLocalizedPath } from '../../config/seo';
import { LAYOUT } from '../../constants/layout';
import { EditorProvider, useEditorContext } from '../../contexts/EditorContext';
import { LayoutProvider, useLayoutContext } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Language, Page } from '../../domain/page';
import i18n from '../../i18n';
import { onOpenTabRequest } from '../../utils/appEvents';
import {
	sidebarAnimations,
	sidebarItemAnimations,
	slideInOut,
	slideUpDown,
} from '../../utils/motionVariants';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import Loading from '../components/Loading/Loading';
import { useAppKeyboardShortcuts } from '../hooks/useAppKeyboardShortcuts';
import Home from '../pages/Home';
import { createAppTheme } from '../theme/createAppTheme';
import { useAppPalette } from '../theme/useAppPalette';
import AppButtons from './AppButtons';
import AppTree from './AppTree';
import Footer from './Footer';
import MetadataComponent from './Metadata';
import Sidebar from './Sidebar';

export { initVisiblePageIndexes, loadPages } from '../../contexts/EditorContext';

const BoxRating = lazy(() => import('../components/Rating/BoxRating'));
const MDContainer = lazy(() => import('../components/MDContainer'));
const Terminal = lazy(() => import('./Terminal'));

const SPRING_TRANSITION = {
	type: 'spring' as const,
	damping: 30,
	stiffness: 200,
	bounce: 0.2,
};

function getTerminalWidth(expanded: boolean): string {
	return `calc(100% - ${LAYOUT.SIDEBAR_WIDTH}px - ${expanded ? `${LAYOUT.EXPLORER_WIDTH}px` : '0px'})`;
}

interface ExplorerDrawerProps {
	expanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	language: Language;
	explorerTitle: string;
	bgExplorer: string;
	bgOverlay: string;
}

function ExplorerDrawer({
	expanded,
	setExpanded,
	language,
	explorerTitle,
	bgExplorer,
	bgOverlay,
}: ExplorerDrawerProps) {
	return (
		<>
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
							boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.2)' : 'none',
						}}
					>
						<Grid
							item
							sx={{
								backgroundColor: bgExplorer,
								height: '100%',
								minHeight: 0,
							}}
						>
							<Stack>
								<motion.div variants={sidebarItemAnimations}>
									<Typography variant='caption' color='text.secondary' sx={{ ml: 4 }}>
										{explorerTitle}
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
					data-testid='sidebar-overlay'
					sx={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: bgOverlay,
						zIndex: 998,
					}}
					onClick={() => setExpanded(false)}
				/>
			)}
		</>
	);
}

interface EditorWorkspaceProps {
	language: Language;
	pages: Page[];
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	terminalOpen: boolean;
}

function EditorWorkspace({
	language,
	pages,
	setPages,
	setSelectedIndex,
	terminalOpen,
}: EditorWorkspaceProps) {
	const terminalOffset = terminalOpen ? `${LAYOUT.TERMINAL_MIN_HEIGHT}px` : '0px';

	return (
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
					height: `calc(100% - ${LAYOUT.TABS_HEIGHT}px - ${terminalOffset})`,
				}}
				transition={SPRING_TRANSITION}
				style={{
					overflowY: 'auto',
					scrollBehavior: 'smooth',
				}}
				role='main'
				aria-label='Main content'
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
					<Route path='*' element={<Navigate to={getLocalizedPath('/', language)} replace />} />
				</Routes>
			</motion.div>
		</Grid>
	);
}

interface TerminalDockProps {
	visible: boolean;
	expanded: boolean;
	language: Language;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

function TerminalDock({
	visible,
	expanded,
	language,
	setTerminal,
	setRanking,
	changeLanguage,
}: TerminalDockProps) {
	const width = getTerminalWidth(expanded);

	return (
		<AnimatePresence>
			{visible && (
				<Grid
					sx={{
						scrollBehavior: 'smooth',
						minHeight: `${LAYOUT.TERMINAL_MIN_HEIGHT}px`,
						overflow: 'hidden',
						position: 'absolute',
						width,
						bottom: LAYOUT.FOOTER_HEIGHT,
						right: 0,
					}}
				>
					<motion.div
						initial={false}
						animate={{ width }}
						transition={SPRING_TRANSITION}
						style={{
							position: 'fixed',
							right: 0,
						}}
					>
						<motion.div variants={slideUpDown} initial='initial' animate='animate' exit='exit'>
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
	);
}

interface AppContentProps {
	changeLanguage: () => void;
}

function AppContent({ changeLanguage }: AppContentProps) {
	const { t } = useTranslation();
	const colors = useAppPalette();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const language = getLanguageFromPathname(pathname);

	const { pages, setPages, setSelectedIndex, openTabByTarget } = useEditorContext();

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
	const { isLoading } = useHomeQuery();

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

	useEffect(() => onOpenTabRequest(openTabByTarget), [openTabByTarget]);

	return (
		<>
			<MetadataComponent />
			{isLoading && <Loading />}
			{!isLoading && ranking && (
				<Suspense fallback={null}>
					<BoxRating ranking={ranking} setRanking={setRanking} />
				</Suspense>
			)}
			<KeyboardShortcutsModal visible={!isLoading} />
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
					<Grid container sx={{ height: '100%', overflow: 'hidden' }}>
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
									<Sidebar language={language} changeLanguage={changeLanguage} />
								</motion.div>
							</Grid>
							<ExplorerDrawer
								expanded={expanded}
								setExpanded={setExpanded}
								language={language}
								explorerTitle={t('sidebar.explorer')}
								bgExplorer={colors.bgExplorer}
								bgOverlay={colors.bgOverlay}
							/>
							<EditorWorkspace
								language={language}
								pages={pages}
								setPages={setPages}
								setSelectedIndex={setSelectedIndex}
								terminalOpen={terminal && !isMobile}
							/>
						</Grid>

						<Grid item lg={12} md={12} sm={12} xs={12} zIndex={2}>
							<Footer />
						</Grid>
					</Grid>
				</Container>
			)}

			<TerminalDock
				visible={!isLoading && terminal && !isMobile}
				expanded={expanded}
				language={language}
				setTerminal={setTerminal}
				setRanking={setRanking}
				changeLanguage={changeLanguage}
			/>
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
