import { Button, Box } from '@mui/material';
import React, { useState } from 'react';
import { VscMarkdown, VscChromeClose } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Container } from '@mui/system';
import { convertFileName } from '../utils/convertFileName';
import TabContextMenu from '../components/TabContextMenu/TabContextMenu';

interface Props {
	pages: {
		index: number;
		name: string;
		route: string;
	}[];
	selectedIndex: number;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	currentComponent: string;
	setCurrentComponent: React.Dispatch<React.SetStateAction<string>>;
	visiblePageIndexes: number[];
	setVisiblePageIndexes: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function AppButtons({
	pages,
	selectedIndex,
	setSelectedIndex,
	currentComponent,
	setCurrentComponent,
	visiblePageIndexes,
	setVisiblePageIndexes,
}: Props) {
	const navigate = useNavigate();
	const theme = useTheme();
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		tabIndex: number;
	} | null>(null);

	function renderButtonBgColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#282A36' : '#21222c';
		} else {
			return selectedIndex === index ? '#ffffff' : '#ececec';
		}
	}

	function renderButtonColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#ffffff' : '#d0d0d0';
		} else {
			return selectedIndex === index ? '#1a1a1a' : '#2a2a2a';
		}
	}

	function renderCloseButtonBgColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#282A36' : '#21222c';
		} else {
			return selectedIndex === index ? '#ffffff' : '#ececec';
		}
	}

	function renderCloseButtonColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#ffffff' : '#d0d0d0';
		} else {
			return selectedIndex === index ? '#1a1a1a' : '#2a2a2a';
		}
	}

	function renderCloseButtonHoverBgColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#333c43' : '#333c43';
		} else {
			return selectedIndex === index ? '#e6e4e5' : '#dadada';
		}
	}

	function renderCloseButtonHoverColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex !== index ? '#d0d0d0' : '#ffffff';
		} else {
			return selectedIndex === index ? '#1a1a1a' : '#1a1a1a';
		}
	}

	const handleContextMenu = (event: React.MouseEvent, index: number) => {
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX,
			mouseY: event.clientY,
			tabIndex: index,
		});
	};

	const handleCloseContextMenu = () => {
		setContextMenu(null);
	};

	const handleCloseTab = () => {
		if (contextMenu) {
			setVisiblePageIndexes(
				visiblePageIndexes.filter((x) => x !== contextMenu.tabIndex)
			);
		}
	};

	const handleCloseOthers = () => {
		if (contextMenu) {
			setVisiblePageIndexes([contextMenu.tabIndex]);
			setSelectedIndex(contextMenu.tabIndex);
			const page = pages.find((x) => x.index === contextMenu.tabIndex);
			if (page) navigate(`/${page.route}`);
		}
	};

	const handleCloseToRight = () => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			const newIndexes = visiblePageIndexes.slice(0, currentPosition + 1);
			setVisiblePageIndexes(newIndexes);
		}
	};

	const handleCloseToLeft = () => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			const newIndexes = visiblePageIndexes.slice(currentPosition);
			setVisiblePageIndexes(newIndexes);
		}
	};

	const handleCloseAll = () => {
		setVisiblePageIndexes([]);
		navigate('/');
	};

	function renderPageButton(index: number, name: string, route: string) {
		return (
			<Box
				key={index}
				sx={{
					display: 'inline-block',
					borderRight: 1,
					borderColor: theme.palette.mode === 'dark' ? '#252525' : '#f3f3f3',
				}}
			>
				<Button
					disableRipple
					disableElevation
					disableFocusRipple
					aria-label={`Open ${convertFileName(name)} page`}
					onClick={() => {
						setSelectedIndex(index);
						setCurrentComponent('button');
						navigate(`/${route}`);
					}}
					onContextMenu={(e: React.MouseEvent<Element, MouseEvent>) => handleContextMenu(e, index)}
					sx={{
						borderRadius: 0,
						px: 2,
						textTransform: 'none',
						backgroundColor: renderButtonBgColor(index),
						color: renderButtonColor(index),
						'&.MuiButtonBase-root:hover': {
							bgcolor: renderButtonBgColor(index),
						},
						transition: 'none',
						pb: 0.2,
					}}
				>
					<Box
						sx={{ color: '#6997d5', width: 20, height: 20, mr: 0.4, ml: -1 }}
					>
						<VscMarkdown />
					</Box>
					{convertFileName(name)}
					<Box
						component="button"
						aria-label={`Close ${convertFileName(name)} tab`}
						tabIndex={0}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								e.stopPropagation();
								setVisiblePageIndexes(
									visiblePageIndexes.filter((x) => x !== index)
								);
							}
						}}
						sx={{
							ml: 1,
							mr: -1,
							backgroundColor: renderCloseButtonBgColor(index),
							color: renderCloseButtonColor(index),
							'&:hover': {
								bgcolor: renderCloseButtonHoverBgColor(index),
								color: renderCloseButtonHoverColor(index),
							},
							width: 20,
							height: 20,
							transition: 'none',
							cursor: 'pointer',
							border: 'none',
							padding: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						onClick={(e: any) => {
							e.stopPropagation();
							setVisiblePageIndexes(
								visiblePageIndexes.filter((x) => x !== index)
							);
						}}
					>
						<VscChromeClose />
					</Box>
				</Button>
			</Box>
		);
	}

	return (
		<>
			<Container
				maxWidth={false}
				disableGutters
				sx={{
					display: 'inline-block',
					overflowX: 'auto',
					overflowY: 'hidden',
					whiteSpace: 'nowrap',
					backgroundColor: theme.palette.mode === 'dark' ? '#191a21' : '#f3f3f3',
					'&::-webkit-scrollbar': {
						height: '3px',
					},
					'&::-webkit-scrollbar-thumb': {
						backgroundColor:
							theme.palette.mode === 'dark' ? '#535353' : '#8c8c8c',
					},
				}}
			>
				{pages.map(({ index, name, route }) =>
					renderPageButton(index, name, route)
				)}
			</Container>

			<TabContextMenu
				contextMenu={contextMenu}
				currentTabIndex={contextMenu?.tabIndex ?? -1}
				visiblePageIndexes={visiblePageIndexes}
				handleClose={handleCloseContextMenu}
				handleCloseTab={handleCloseTab}
				handleCloseOthers={handleCloseOthers}
				handleCloseToRight={handleCloseToRight}
				handleCloseToLeft={handleCloseToLeft}
				handleCloseAll={handleCloseAll}
			/>
		</>
	);
}