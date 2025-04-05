import {
	Container,
	createTheme,
	CssBaseline,
	darkScrollbar,
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

import { isBrowser } from 'react-device-detect';
import Terminal from './Terminal';
import Rating from '../components/Rating/Rating';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import i18n from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { pageRoutes } from '../pages/pages';
import { useTranslation } from 'react-i18next';

interface Page {
	index: number;
	name: string;
	route: string;
}

function initVisiblePageIndexs(pages: Page[]) {
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
	const pages = pageRoutes[language];
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(isBrowser);
	const [terminal, setTerminal] = useState(isBrowser);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);
	const [currentComponent, setCurrentComponent] = useState('');
	const [visiblePageIndexs, setVisiblePageIndexs] = useState(
		initVisiblePageIndexs(pages)
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
			MuiCssBaseline: {
				styleOverrides: {
					body: paletteType === 'dark' ? darkScrollbar() : null,
				},
			},
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
		(x) => !visiblePageIndexs.includes(x.index)
	)?.index;

	useEffect(() => {
		const newPages = [];

		for (const index of visiblePageIndexs) {
			const page = pages.find((x) => x.index === index);
			if (page) newPages.push(page);
		}
		setVisiblePages(newPages);

		if (visiblePageIndexs.length === 0) {
			setSelectedIndex(-1);
			navigate('/');
		} else if (
			deletedIndex === selectedIndex &&
			deletedIndex > Math.max(...visiblePageIndexs)
		) {
			setSelectedIndex(Math.max(...visiblePageIndexs));
			const page = pages.find(
				(x) => x.index === Math.max(...visiblePageIndexs)
			);
			if (page) navigate('/' + page.route);
		} else if (
			deletedIndex === selectedIndex &&
			deletedIndex < Math.max(...visiblePageIndexs)
		) {
			setSelectedIndex(Math.min(...visiblePageIndexs));
			const page = pages.find(
				(x) => x.index === Math.min(...visiblePageIndexs)
			);
			if (page) navigate('/' + page.route);
		}
	}, [visiblePageIndexs, navigate, deletedIndex, selectedIndex, pages]);

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

	return (
		<>
			<KeyboardShortcutsModal visible={true} />
			{language && (
				<ThemeProvider theme={theme}>
					<CssBaseline enableColorScheme />
					{ranking && (
						<Rating
							language={language}
							setRanking={setRanking}
						></Rating>
					)}
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
								>
									<Sidebar
										setExpanded={setExpanded}
										expanded={expanded}
										terminal={terminal}
										setTerminal={setTerminal}
										language={language}
										changeLanguage={changeLanguage}
									/>
								</Grid>
								{expanded && (
									<Grid
										item
										sx={{
											backgroundColor: isDarkMode ? '#21222c' : '#f3f3f3',
											width: 220,
										}}
									>
										<Stack sx={{ mt: 1 }}>
											<Typography
												variant='caption'
												color='text.secondary'
												sx={{ ml: 4 }}
											>
												{t('sidebar.explorer')}
											</Typography>
											<AppTree
												pages={pages}
												selectedIndex={selectedIndex}
												setSelectedIndex={setSelectedIndex}
												currentComponent={currentComponent}
												setCurrentComponent={setCurrentComponent}
												visiblePageIndexs={visiblePageIndexs}
												setVisiblePageIndexs={setVisiblePageIndexs}
												language={language}
											/>
										</Stack>
									</Grid>
								)}
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
											visiblePageIndexs={visiblePageIndexs}
											setVisiblePageIndexs={setVisiblePageIndexs}
										/>
									</Grid>
									<Grid
										sx={{
											scrollBehavior: 'smooth',
											// overflow: 'scroll',
											overflowY: 'auto',
											height: `calc(100vh - 20px - 33px - ${terminal ? '300px' : '0px'
												})`,
										}}
									>
										<Routes>
											<Route
												path='/'
												element={
													<Home
														setSelectedIndex={setSelectedIndex}
														language={language}
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
									</Grid>
									<Grid
										sx={{
											scrollBehavior: 'smooth',
											// overflow: 'scroll',
											overflowY: 'auto',
											width: '100%',
											height: `${terminal ? '300px' : '0px'}`,
										}}
									>
										<Terminal
											language={language}
											selectedTerminalIndex={selectedTerminalIndex}
											setSelectedTerminalIndex={setSelectedTerminalIndex}
											setTerminal={setTerminal}
											setRanking={setRanking}
											changeLanguage={changeLanguage}
										/>
									</Grid>
								</Grid>
							</Grid>

							<Grid
								item
								lg={12}
								md={12}
								sm={12}
								xs={12}
							>
								<Footer />
							</Grid>
						</Grid>
					</Container>
					{/* </Router> */}
				</ThemeProvider>
			)}
		</>
	);
}
