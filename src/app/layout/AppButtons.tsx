import { Button, Box, Container } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { VscMarkdown, VscChromeClose } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { convertFileName } from '../../utils/convertFileName';
import TabContextMenu from '../components/TabContextMenu/TabContextMenu';
import { Language, Page } from '../../domain/page';
import { getLocalizedPath } from '../../config/seo';
import { useAppPalette } from '../theme/useAppPalette';
import { useEditorContext } from '../../contexts/EditorContext';

interface Props {
	language: Language;
}

interface PageTabProps {
	page: Page;
	isSelected: boolean;
	onOpen: () => void;
	onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
	onContextMenu: (e: React.MouseEvent) => void;
}

function PageTab({
	page,
	isSelected,
	onOpen,
	onClose,
	onContextMenu,
}: PageTabProps) {
	const colors = useAppPalette();
	const displayName = convertFileName(page.name);

	const handleCloseKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			e.stopPropagation();
			onClose(e);
		}
	};

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				borderRight: 1,
				borderColor: colors.border,
			}}
		>
			<Button
				disableRipple
				disableElevation
				disableFocusRipple
				aria-label={`Open ${displayName} page`}
				onClick={onOpen}
				onContextMenu={onContextMenu}
				sx={{
					borderRadius: 0,
					px: 2,
					pr: 0.5,
					textTransform: 'none',
					backgroundColor: isSelected ? colors.bgTabActive : colors.bgTabInactive,
					color: isSelected ? colors.textPrimary : colors.textSecondary,
					'&.MuiButtonBase-root:hover': {
						bgcolor: isSelected ? colors.bgTabActive : colors.bgHover,
					},
					transition: 'none',
					pb: 0.2,
					display: 'inline-flex',
					alignItems: 'center',
					gap: 0.5,
				}}
			>
				<Box
					component="span"
					sx={{
						color: colors.iconMarkdown,
						width: 20,
						height: 20,
						display: 'flex',
						alignItems: 'center',
					}}
					aria-hidden="true"
				>
					<VscMarkdown />
				</Box>
				{displayName}
			</Button>

			<Box
				component="span"
				role="button"
				aria-label={`Close ${displayName}`}
				tabIndex={0}
				onKeyDown={handleCloseKeyDown}
				onClick={(e: React.MouseEvent<HTMLElement>) => {
					e.stopPropagation();
					onClose(e);
				}}
				sx={{
					mx: 0.5,
					backgroundColor: isSelected ? colors.bgTabActive : colors.bgTabInactive,
					color: isSelected ? colors.textPrimary : colors.textSecondary,
					'&:hover': {
						bgcolor: colors.bgHover,
						color: colors.textPrimary,
					},
					width: 20,
					height: 20,
					flexShrink: 0,
					transition: 'none',
					cursor: 'pointer',
					border: 'none',
					padding: 0,
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '2px',
				}}
			>
				<VscChromeClose aria-hidden="true" />
			</Box>
		</Box>
	);
}

export default function AppButtons({ language }: Props) {
	const {
		visiblePages,
		pages,
		selectedIndex,
		setSelectedIndex,
		setCurrentComponent,
		visiblePageIndexes,
		setVisiblePageIndexes,
	} = useEditorContext();
	const navigate = useNavigate();
	const colors = useAppPalette();
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		tabIndex: number;
	} | null>(null);

	const handleContextMenu = useCallback((event: React.MouseEvent, index: number) => {
		event.preventDefault();
		setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, tabIndex: index });
	}, []);

	const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);

	const handleCloseTab = useCallback(() => {
		if (contextMenu) {
			setVisiblePageIndexes((prev) => prev.filter((x) => x !== contextMenu.tabIndex));
		}
	}, [contextMenu, setVisiblePageIndexes]);

	const handleCloseOthers = useCallback(() => {
		if (contextMenu) {
			setVisiblePageIndexes([contextMenu.tabIndex]);
			setSelectedIndex(contextMenu.tabIndex);
			const page = pages.find((x) => x.index === contextMenu.tabIndex);
			if (page) navigate(getLocalizedPath(`/${page.route}`, language));
		}
	}, [contextMenu, language, navigate, pages, setSelectedIndex, setVisiblePageIndexes]);

	const handleCloseToRight = useCallback(() => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			setVisiblePageIndexes(visiblePageIndexes.slice(0, currentPosition + 1));
		}
	}, [contextMenu, setVisiblePageIndexes, visiblePageIndexes]);

	const handleCloseToLeft = useCallback(() => {
		if (contextMenu) {
			const currentPosition = visiblePageIndexes.indexOf(contextMenu.tabIndex);
			setVisiblePageIndexes(visiblePageIndexes.slice(currentPosition));
		}
	}, [contextMenu, setVisiblePageIndexes, visiblePageIndexes]);

	const handleCloseAll = useCallback(() => {
		setVisiblePageIndexes([]);
		setSelectedIndex(-1);
		navigate(getLocalizedPath('/', language));
	}, [language, navigate, setSelectedIndex, setVisiblePageIndexes]);

	return (
		<>
			<Container
				maxWidth={false}
				disableGutters
				sx={{
					display: 'inline-flex',
					overflowX: 'auto',
					overflowY: 'hidden',
					whiteSpace: 'nowrap',
					backgroundColor: colors.bgTabs,
					'&::-webkit-scrollbar': { height: '3px' },
					'&::-webkit-scrollbar-thumb': { backgroundColor: colors.scrollbar },
				}}
			>
				{visiblePages.map((page) => (
					<PageTab
						key={page.index}
						page={page}
						isSelected={selectedIndex === page.index}
						onOpen={() => {
							setSelectedIndex(page.index);
							setCurrentComponent('button');
							navigate(getLocalizedPath(`/${page.route}`, language));
						}}
						onClose={() =>
							setVisiblePageIndexes((prev) => prev.filter((x) => x !== page.index))
						}
						onContextMenu={(e) => handleContextMenu(e, page.index)}
					/>
				))}
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
