import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
	VscAdd,
	VscClose,
	VscEllipsis,
	VscTrash,
	VscTerminalCmd,
	VscSplitHorizontal,
	VscChevronDown,
} from 'react-icons/vsc';
import Problems from '../components/Terminal/Problems';
import Output from '../components/Terminal/Output';
import Debug from '../components/Terminal/Debug';
import Cmd from '../components/Terminal/Cmd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppPalette } from '../theme/useAppPalette';
import { Language } from '../../domain/page';

interface Props {
	language: Language;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

const Terminal = ({
	language,
	setTerminal,
	setRanking,
	changeLanguage,
}: Props) => {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const colors = useAppPalette();
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);
	const terminalTabs = useMemo(() => [
		{
			index: 0,
			name: t('terminal.tabs.problems'),
			element: <Problems language={language} />,
		},
		{
			index: 1,
			name: t('terminal.tabs.output'),
			element: <Output language={language} />,
		},
		{
			index: 2,
			name: t('terminal.tabs.debug'),
			element: <Debug language={language} />,
		},
		{
			index: 3,
			name: t('terminal.tabs.terminal'),
			element: (
				<Cmd
					setRanking={setRanking}
					changeLanguage={changeLanguage}
					language={language}
				/>
			),
		},
	], [t, language, setRanking, changeLanguage]);


	function renderTerminalBgColor(index: number) {
		return selectedTerminalIndex === index ? colors.tabIndicator : 'transparent';
	}
	function renderTerminalColor(index: number) {
		return selectedTerminalIndex === index ? colors.textPrimary : colors.textSecondary;
	}

	return (
		<Box
			sx={{
				height: `100%`,
				width: `100%`,
				backgroundColor: colors.bgTerminal,
				borderTop: `1px solid ${colors.border}`,
			}}
			component={Paper}
			square
			elevation={0}
		>
			<Box
				justifyContent='space-between'
				alignItems='center'
				display='flex'
				flexDirection='row'
				role="tablist"
				aria-label="Terminal tabs"
			>
				<Stack
					direction='row'
					sx={{ pl: 1 }}
					spacing={2}
					role="tablist"
				>
					{terminalTabs.map(({ index, name }) => (
						<Box
							key={index}
							component="button"
							aria-label={`Switch to ${name} tab`}
							aria-selected={selectedTerminalIndex === index}
							role="tab"
							tabIndex={selectedTerminalIndex === index ? 0 : -1}
							onKeyDown={(e: React.KeyboardEvent) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									setSelectedTerminalIndex(index);
								}
							}}
							onClick={() => {
								setSelectedTerminalIndex(index);
							}}
							sx={{
								borderBottom: `1px solid transparent`,
								borderColor: renderTerminalBgColor(index),
								color: renderTerminalColor(index),
								cursor: 'pointer',
								'&:hover': {
									color: colors.textPrimary,
								},
								WebkitTapHighlightColor: 'rgba(0,0,0,0)',
								p: 0.8,
								border: 'none',
								background: 'transparent',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Typography sx={{ fontSize: '.7rem' }}>
								{name.toUpperCase()}
							</Typography>
						</Box>
					))}
				</Stack>
				<Stack
					direction='row'
					spacing={0}
					role="toolbar"
					aria-label="Terminal toolbar"
				>
					<Box
						component="button"
						aria-label="Open terminal command"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						display='flex'
						gap={0.5}
						alignItems='center'
						sx={{
							cursor: 'pointer',
							height: 33,
							'&:hover': {
								backgroundColor: colors.bgHover,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
						}}
					>
						<VscTerminalCmd />
						<Typography sx={{ fontSize: '.8rem' }}>cmd</Typography>
					</Box>
					<Box
						component="button"
						aria-label="Add new terminal"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						display='flex'
						gap={0.5}
						alignItems='center'
						sx={{
							cursor: 'pointer',
							height: 33,

							'&:hover': {
								backgroundColor: colors.bgHover,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
						}}
					>
						<VscAdd />
						<VscChevronDown />
					</Box>
					<Box
						component="button"
						aria-label="Split terminal"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						sx={{
							cursor: 'pointer',
							'&:hover ': {
								backgroundColor: colors.bgHover,
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<VscSplitHorizontal />
					</Box>
					<Box
						component="button"
						aria-label="Delete terminal"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						sx={{
							cursor: 'pointer',
							'&:hover ': {
								backgroundColor: colors.bgHover,
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<VscTrash />
					</Box>
					<Box
						component="button"
						aria-label="More options"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						sx={{
							cursor: 'pointer',
							'&:hover ': {
								backgroundColor: colors.bgHover,
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<VscEllipsis />
					</Box>
					<Box
						component="button"
						aria-label="Close terminal"
						tabIndex={0}
						onKeyDown={(e: { key: string; preventDefault: () => void; }) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setTerminal(false);
							}
						}}
						onClick={() => setTerminal(false)}
						sx={{
							cursor: 'pointer',
							'&:hover': {
								backgroundColor: colors.bgHover,
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
							border: 'none',
							background: 'transparent',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<VscClose />
					</Box>
				</Stack>
			</Box>
			<Box
				height={'86%'}
				position={'relative'}
				overflow={'auto'}
				sx={{
					px: selectedTerminalIndex === 3 ? 0 : 2,
					backgroundColor: selectedTerminalIndex === 3 ? colors.bgTerminal : 'transparent',
				}}
			>
				{terminalTabs[selectedTerminalIndex].element}
			</Box>
		</Box>
	);
};

export default Terminal;
