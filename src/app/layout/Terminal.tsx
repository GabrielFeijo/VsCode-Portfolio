import React from 'react';
import { useTheme } from '@mui/material/styles';
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

interface Props {
	darkMode: boolean;
	language: string;
	selectedTerminalIndex: number;
	setSelectedTerminalIndex: React.Dispatch<React.SetStateAction<number>>;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

const Terminal = ({
	darkMode,
	language,
	selectedTerminalIndex,
	setSelectedTerminalIndex,
	setTerminal,
	setRanking,
	setDarkMode,
	changeLanguage,
}: Props) => {
	const theme = useTheme();
	function renderTerminalBgColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedTerminalIndex === index ? '#ff79c6' : 'transparent';
		} else {
			return selectedTerminalIndex === index ? '#000' : 'transparent';
		}
	}
	function renderTerminalColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedTerminalIndex === index ? '#fff' : '#6272a4';
		} else {
			return selectedTerminalIndex === index ? '#000' : 'gray';
		}
	}
	const opc = [
		{ index: 0, name: 'Problemas', element: <Problems language={language} /> },
		{ index: 1, name: 'Saída', element: <Output language={language} /> },
		{
			index: 2,
			name: 'Console de Depuração',
			element: <Debug language={language} />,
		},
		{
			index: 3,
			name: 'Terminal',
			element: (
				<Cmd
					language={language}
					setRanking={setRanking}
					setDarkMode={setDarkMode}
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
				backgroundColor: darkMode ? '#282a36' : '#fff',
				borderTop: `1px solid transparent`,
				borderColor: darkMode ? '#bd93f9' : '#000',
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
							onClick={() => {
								setSelectedTerminalIndex(index);
							}}
							sx={{
								borderBottom: `1px solid transparent`,
								borderColor: renderTerminalBgColor(index),
								color: renderTerminalColor(index),
								cursor: 'pointer',
								'&:hover': {
									color: darkMode ? 'white' : '#000',
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
