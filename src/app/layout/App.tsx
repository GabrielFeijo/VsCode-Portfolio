import {
	Container,
	createTheme,
	CssBaseline,
	Grid,
	Stack,
	ThemeProvider,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import AppTree from './AppTree';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AppButtons from './AppButtons';
import MDContainer from '../components/MDContainer';
import Home from '../pages/Home';
import { motion, AnimatePresence } from 'framer-motion';
import { isBrowser } from 'react-device-detect';
import Terminal from './Terminal';
import BoxRating from '../components/Rating/BoxRating';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import i18n from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { pageRoutes } from '../pages/pages';
import { useTranslation } from 'react-i18next';
import { sidebarAnimations, sidebarItemAnimations, slideInOut, slideUpDown } from '../../utils/motionVariants';
import { Page, StorageService } from '../../services/storageService';

function initVisiblePageIndexes(pages: Page[]) {
	const tabs = [];
	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];
		tabs.push(page.index);
	}
	return tabs;
}

export default function App() {
	const [language, setLanguage] = useState(i18n.language as 'pt' | 'en');
	const { theme: paletteType, toggleTheme } = useTheme();
	const { t } = useTranslation();
	const isDarkMode = paletteType === 'dark';

	const [pages, setPages] = useState<Page[]>(pageRoutes[language]);
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(isBrowser);
	const [terminal, setTerminal] = useState(isBrowser);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);
	const [currentComponent, setCurrentComponent] = useState('');
	const [visiblePageIndexes, setVisiblePageIndexes] = useState(
		initVisiblePageIndexes(pages)
	);
	const [ranking, setRanking] = useState(false);

	const [visiblePages, setVisiblePages] = useState(pages);

	const theme = createTheme({
		palette: {
			mode: paletteType,
			background: {
				default: paletteType === 'light' ? '#FFFFFF' : '#282A36',
			},
		},
		components: {
			MuiDivider: {
				styleOverrides: {
					root: {
						borderColor: 'rgba(255, 255, 255, 0.12)',
					},
				},
			},
		},
	});

	function changeLanguage() {
		const newLanguage = language === 'pt' ? 'en' : 'pt';
		setLanguage(newLanguage);
		i18n.changeLanguage(newLanguage);
	}

	const deletedIndex = visiblePages.find(
		(x) => !visiblePageIndexes.includes(x.index)
	)?.index;

	useEffect(() => {
		const newPages = [];

		for (const index of visiblePageIndexes) {
			const page = pages.find((x) => x.index === index);
			if (page) newPages.push(page);
		}
		setVisiblePages(newPages);

		if (visiblePageIndexes.length === 0) {
			setSelectedIndex(-1);
			navigate('/');
		} else if (
			deletedIndex === selectedIndex &&
			deletedIndex > Math.max(...visiblePageIndexes)
		) {
			setSelectedIndex(Math.max(...visiblePageIndexes));
			const page = pages.find(
				(x) => x.index === Math.max(...visiblePageIndexes)
			);
			if (page) navigate('/' + page.route);
		} else if (
			deletedIndex === selectedIndex &&
			deletedIndex < Math.max(...visiblePageIndexes)
		) {
			setSelectedIndex(Math.min(...visiblePageIndexes));
			const page = pages.find(
				(x) => x.index === Math.min(...visiblePageIndexes)
			);
			if (page) navigate('/' + page.route);
		}
	}, [visiblePageIndexes, navigate, deletedIndex, selectedIndex, pages]);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.ctrlKey && e.key === 'j') {
				e.preventDefault();
				setTerminal((prev) => !prev);
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'd') {
				e.preventDefault();
				toggleTheme();
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'l') {
				e.preventDefault();
				changeLanguage();
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'b') {
				e.preventDefault();
				setExpanded((prev) => !prev);
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'h') {
				e.preventDefault();
				navigate('/');
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language]);


	useEffect(() => {
		const pages = StorageService.getData()
		if (pages.length === 0) return
		setPages(pages);
	}, []);

	return (
		<>
			<BoxRating ranking={ranking} setRanking={setRanking} />
			<KeyboardShortcutsModal visible={true} />
			{language && (
				<ThemeProvider theme={theme}>
					<CssBaseline enableColorScheme />
					<Container
						sx={{ m: 0, p: 0, overflowY: 'hidden' }}
						maxWidth={false}
						disableGutters
					>
						<Grid
							container
							sx={{ overflow: 'auto', overflowY: 'hidden' }}
						>
							<Grid
								container
								sx={{ overflow: 'auto' }}
							>
								<Grid
									item
									sx={{ width: 50 }}
									zIndex={2}
								>
									<motion.div
										variants={slideInOut}
										initial="initial"
										animate="animate"
										exit="exit"
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
								<AnimatePresence mode="wait">
									{expanded && (
										<motion.div
											variants={sidebarAnimations}
											initial="initial"
											animate="animate"
											exit="exit"
											layout="position"
										>
											<Grid
												item
												sx={{
													backgroundColor: isDarkMode ? '#21222c' : '#f3f3f3',
													minHeight: `calc(100vh - 20px)`,
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
								<Grid
									item
									xs
									zeroMinWidth
								>
									<Grid
										sx={{
											height: '33px',
										}}
									>
										<AppButtons
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
											height: `calc(100vh - 20px - 33px - ${terminal ? '300px' : '0px'})`
										}}
										transition={{
											type: "spring",
											damping: 30,
											stiffness: 200,
											bounce: 0.2
										}}
										style={{
											overflowY: 'auto',
											scrollBehavior: 'smooth'
										}}
									>
										<Routes>
											<Route
												path='/'
												element={
													<Home
														setSelectedIndex={setSelectedIndex}
														terminal={terminal}
													/>
												}
											/>
											{pages.map(({ index, name, route }) => (
												<Route
													key={index}
													path={`/${route}`}
													element={
														<MDContainer
															path={`./pages/${language.toLowerCase()}/${name}`}
															page={pages.find(p => p.index === index)}
															setPages={setPages}
														/>
													}
												/>
											))}
											<Route
												path='*'
												element={
													<Navigate
														to='/'
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

					<AnimatePresence >
						{terminal && (
							<Grid
								sx={{
									scrollBehavior: 'smooth',
									minHeight: '300px',
									overflow: 'hidden',
									position: 'absolute',
									width: `calc(100% - 50px)`,
									bottom: 20,
									right: 0
								}}
							>
								<motion.div
									initial={false}
									animate={{
										width: `calc(100% - 50px - ${expanded ? '220px' : '0px'})`,
									}}
									transition={{
										type: "spring",
										damping: 30,
										stiffness: 200,
										bounce: 0.2
									}}
									style={{
										position: 'fixed',
										right: 0
									}}
								>
									<motion.div
										variants={slideUpDown}
										initial="initial"
										animate="animate"
										exit="exit"
									>
										<Terminal
											language={language}
											selectedTerminalIndex={selectedTerminalIndex}
											setSelectedTerminalIndex={setSelectedTerminalIndex}
											setTerminal={setTerminal}
											setRanking={setRanking}
											changeLanguage={changeLanguage}
										/>
									</motion.div>
								</motion.div>
							</Grid>
						)}
					</AnimatePresence>

				</ThemeProvider >
			)
			}
		</>
	);
}
