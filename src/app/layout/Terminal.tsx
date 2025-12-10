import React from 'react';
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

interface Props {
	language: 'pt' | 'en';
	selectedTerminalIndex: number;
	setSelectedTerminalIndex: React.Dispatch<React.SetStateAction<number>>;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

const Terminal = ({
	language,
	selectedTerminalIndex,
	setSelectedTerminalIndex,
	setTerminal,
	setRanking,
	changeLanguage,
}: Props) => {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const isDarkMode = theme === 'dark';

	function renderTerminalBgColor(index: number) {
		if (isDarkMode) {
			return selectedTerminalIndex === index ? '#ff79c6' : 'transparent';
		} else {
			return selectedTerminalIndex === index ? '#000' : 'transparent';
		}
	}
	function renderTerminalColor(index: number) {
		if (isDarkMode) {
			return selectedTerminalIndex === index ? '#fff' : '#6272a4';
		} else {
			return selectedTerminalIndex === index ? '#000' : 'gray';
		}
	}
	const opc = [
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
				/>
			),
		},
	];

	return (
		<Box
			sx={{
				height: `100%`,
				width: `100%`,
				backgroundColor: isDarkMode ? '#282A36' : '#fff',
				borderTop: `1px solid transparent`,
				borderColor: isDarkMode ? '#bd93f9' : '#000',
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
			>
				<Stack
					direction='row'
					sx={{ pl: 1 }}
					spacing={2}
				>
					{opc.map(({ index, name }) => (
						<Box
							key={index}
							role="button"
							aria-label={`Switch to ${name} tab`}
							tabIndex={0}
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
									color: isDarkMode ? 'white' : '#000',
								},
								WebkitTapHighlightColor: 'rgba(0,0,0,0)',
								p: 0.8,
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
				>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
						}}
					>
						<VscTerminalCmd />
						<Typography sx={{ fontSize: '.8rem' }}>cmd</Typography>
					</Box>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
						}}
					>
						<VscAdd />
						<VscChevronDown />
					</Box>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
						}}
					>
						<VscSplitHorizontal />
					</Box>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
						}}
					>
						<VscTrash />
					</Box>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
						}}
					>
						<VscEllipsis />
					</Box>
					<Box
						role="button"
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
								backgroundColor: '#383a4294',
								height: 33,
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							p: 1,
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
					px: 2,
				}}
			>
				{opc[selectedTerminalIndex].element}
			</Box>
		</Box>
	);
};

export default Terminal;
