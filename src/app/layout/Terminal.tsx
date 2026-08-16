import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import Problems from '../components/Terminal/Problems';
import Output from '../components/Terminal/Output';
import Debug from '../components/Terminal/Debug';
import Cmd from '../components/Terminal/Cmd';
import { useTranslation } from 'react-i18next';
import { useAppPalette } from '../theme/useAppPalette';
import { Language } from '../../domain/page';
import { TerminalToolbar } from './TerminalToolbar';

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
	const colors = useAppPalette();
	const [selectedTerminalIndex, setSelectedTerminalIndex] = useState(3);

	const terminalTabs = useMemo(() => [
		{
			index: 0,
			name: t('terminal.tabs.problems'),
			element: <Problems />,
		},
		{
			index: 1,
			name: t('terminal.tabs.output'),
			element: <Output />,
		},
		{
			index: 2,
			name: t('terminal.tabs.debug'),
			element: <Debug />,
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
				height: '100%',
				width: '100%',
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
								borderBottom: '1px solid transparent',
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
				<TerminalToolbar onCloseTerminal={() => setTerminal(false)} />
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
