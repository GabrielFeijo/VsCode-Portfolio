import { Button, Box, Container } from '@mui/material';
import React, { useState } from 'react';
import { VscMarkdown, VscChromeClose } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { convertFileName } from '../../utils/convertFileName';
import TabContextMenu from '../components/TabContextMenu/TabContextMenu';
import { Language, Page } from '../../domain/page';
import { getLocalizedPath } from '../../config/seo';
import { useAppPalette } from '../theme/useAppPalette';

interface Props {
	pages: Page[];
	language: Language;
	selectedIndex: number;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	currentComponent: string;
	setCurrentComponent: React.Dispatch<React.SetStateAction<string>>;
	visiblePageIndexes: number[];
	setVisiblePageIndexes: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function AppButtons({
	pages,
	language,
	selectedIndex,
	setSelectedIndex,
	currentComponent,
	setCurrentComponent,
	visiblePageIndexes,
	setVisiblePageIndexes,
}: Props) {
	const navigate = useNavigate();
	const theme = useTheme();
	const colors = useAppPalette();
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		tabIndex: number;
	} | null>(null);

	const isSelected = (index: number) => selectedIndex === index;

	function renderPageButton(index: number, name: string, route: string) {
		const selected = isSelected(index);
		return (
			<Box
				key={index}
				sx={{
					display: 'inline-block',
					borderRight: 1,
					borderColor: colors.border,
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
						navigate(getLocalizedPath(`/${route}`, language));
					}}
					onContextMenu={(e: React.MouseEvent<Element, MouseEvent>) => handleContextMenu(e, index)}
					sx={{
						borderRadius: 0,
						px: 2,
						textTransform: 'none',
						backgroundColor: selected ? colors.bgTabActive : colors.bgTabInactive,
						color: selected ? colors.textPrimary : colors.textSecondary,
						'&.MuiButtonBase-root:hover': {
							bgcolor: selected ? colors.bgTabActive : colors.bgHover,
						},
						transition: 'none',
						pb: 0.2,
					}}
				>
					<Box sx={{ color: colors.iconMarkdown, width: 20, height: 20, mr: 0.4, ml: -1 }}>
						<VscMarkdown />
					</Box>
					{convertFileName(name)}
					<Box
						aria-label={`Close ${convertFileName(name)} tab`}
						tabIndex={0}
						onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								e.stopPropagation();
								setVisiblePageIndexes(visiblePageIndexes.filter((x) => x !== index));
							}
						}}
						sx={{
							ml: 1,
							mr: -1,
							backgroundColor: selected ? colors.bgTabActive : colors.bgTabInactive,
							color: selected ? colors.textPrimary : colors.textSecondary,
							'&:hover': {
								bgcolor: colors.bgHover,
								color: colors.textPrimary,
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
						onClick={(e: React.MouseEvent<HTMLDivElement>) => {
							e.stopPropagation();
							setVisiblePageIndexes(visiblePageIndexes.filter((x) => x !== index));
						}}
					>
						<VscChromeClose />
					</Box>
				</Button>
			</Box>
		);
	}

	const handleContextMenu = (event: React.MouseEvent, index: number) => {
		event.preventDefault();
		setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, tabIndex: index });
	};

	const handleCloseContextMenu = () => setContextMenu(null);

	const handleCloseTab = () => {
		if (contextMenu) {
			setVisiblePageIndexes(visiblePageIndexes.filter((x) => x !== contextMenu.tabIndex));
		}
	};

	const handleCloseOthers = () => {
		if (contextMenu) {
			setVisiblePageIndexes([contextMenu.tabIndex]);
			setSelectedIndex(contextMenu.tabIndex);
			const page = pages.find((x) => x.index === contextMenu.tabIndex);
			if (page) navigate(getLocalizedPath(`/${page.route}`, language));
		}
	};

	const handleCloseToRight = () => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			setVisiblePageIndexes(visiblePageIndexes.slice(0, currentPosition + 1));
		}
	};

	const handleCloseToLeft = () => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			setVisiblePageIndexes(visiblePageIndexes.slice(currentPosition));
		}
	};

	const handleCloseAll = () => {
		setVisiblePageIndexes([]);
		navigate(getLocalizedPath('/', language));
	};

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
					backgroundColor: colors.bgTabs,
					'&::-webkit-scrollbar': { height: '3px' },
					'&::-webkit-scrollbar-thumb': { backgroundColor: colors.scrollbar },
				}}
			>
				{pages.map(({ index, name, route }) => renderPageButton(index, name, route))}
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
