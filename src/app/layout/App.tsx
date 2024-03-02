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
import { allPages } from '../pages/pages';

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
	const [language, setLanguage] = useState<'pt-BR' | 'en'>('pt-BR');
	const pages = language === 'pt-BR' ? allPages['pt-BR'] : allPages['en'];
	const navigate = useNavigate();

	const [expanded, setExpanded] = useState(isBrowser);
	const [terminal, setTerminal] = useState(isBrowser);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);
	const [currentComponent, setCurrentComponent] = useState('');
	const [visiblePageIndexs, setVisiblePageIndexs] = useState(
		initVisiblePageIndexs(pages)
	);
	const [darkMode, setDarkMode] = useState(false);
	const [ranking, setRanking] = useState(false);

	const [visiblePages, setVisiblePages] = useState(pages);
	const paletteType = darkMode ? 'dark' : 'light';

	const theme = createTheme({
		palette: {
			mode: paletteType,
			background: {
				default: paletteType === 'light' ? '#FFFFFF' : '#282a36',
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

	function handleThemeChange() {
		setDarkMode(!darkMode);
		localStorage.setItem('theme', darkMode ? 'light' : 'dark');
	}

	function changeLanguage() {
		const newLanguage = language === 'pt-BR' ? 'en' : 'pt-BR';

		setLanguage(newLanguage);
		localStorage.setItem('language', newLanguage);
	}

	useEffect(() => {
		const currentTheme = localStorage.getItem('theme');
		const currentLanguage = localStorage.getItem('language');
		if (!currentTheme) setDarkMode(true);
		else setDarkMode(currentTheme === 'dark');

		if (currentLanguage) {
			if (currentLanguage === 'en') {
				setLanguage('en');
			}
		}
	}, []);

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

	return (
		<>
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
										darkMode={darkMode}
										handleThemeChange={handleThemeChange}
										language={language}
										changeLanguage={changeLanguage}
									/>
								</Grid>
								{expanded && (
									<Grid
										item
										sx={{
											backgroundColor: darkMode ? '#21222c' : '#f3f3f3',
											width: 220,
										}}
									>
										<Stack sx={{ mt: 1 }}>
											<Typography
												variant='caption'
												color='text.secondary'
												sx={{ ml: 4 }}
											>
												{language === 'pt-BR' ? 'EXPLORADOR' : 'EXPLORER'}
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
											height: `calc(100vh - 20px - 33px - ${
												terminal ? '300px' : '0px'
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
														<MDContainer path={`./pages/${language}/${name}`} />
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
											darkMode={darkMode}
											language={language}
											selectedTerminalIndex={selectedTerminalIndex}
											setSelectedTerminalIndex={setSelectedTerminalIndex}
											setTerminal={setTerminal}
											setRanking={setRanking}
											setDarkMode={setDarkMode}
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
