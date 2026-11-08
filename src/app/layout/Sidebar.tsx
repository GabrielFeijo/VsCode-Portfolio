import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import { Box, Link, Paper, Tooltip } from '@mui/material';
import Divider from '@mui/material/Divider';
import type React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { VscFiles, VscSettingsGear } from 'react-icons/vsc';
import { useLayoutContext } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactLinks } from '../hooks/useContactLinks';
import { useAppPalette } from '../theme/useAppPalette';

interface Props {
	language: string;
	changeLanguage: () => void;
}

function handleActivationKeyDown(action: () => void) {
	return (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		action();
	};
}

export default function Sidebar({ changeLanguage }: Props) {
	const {
		expanded,
		setExpanded,
		terminal,
		setTerminal,
		isMobile: ctxIsMobile,
	} = useLayoutContext();
	const { theme, toggleTheme } = useTheme();
	const colors = useAppPalette();
	const { t, i18n } = useTranslation();
	const contactLinks = useContactLinks();
	const isMobileViewport = Boolean(isMobile || ctxIsMobile);

	const iconSx = {
		flexGrow: 0,
		fontSize: 24,
		color: colors.icon,
		cursor: 'pointer',
		'&:hover': { color: colors.iconActive },
	};

	const toggleExplorer = () => setExpanded(!expanded);
	const toggleTerminal = () => setTerminal(!terminal);
	const languageKey = `sidebar.language.to${i18n.language === 'pt' ? 'English' : 'Portuguese'}`;

	return (
		<Box
			sx={{
				height: '100%',
				backgroundColor: colors.bgSidebar,
				overflowY: 'auto',
				overflowX: 'hidden',
			}}
			justifyContent='space-between'
			display='flex'
			flexDirection='column'
			component={Paper}
			square
			elevation={0}
		>
			<Box sx={{ flexGrow: 0 }} display='flex' justifyContent='center' flexDirection='column'>
				<Box
					component='button'
					aria-label={
						expanded
							? t('sidebar.closeExplorer') || 'Close explorer'
							: t('sidebar.openExplorer') || 'Open explorer'
					}
					aria-expanded={expanded}
					tabIndex={0}
					onKeyDown={handleActivationKeyDown(toggleExplorer)}
					sx={{
						borderLeft: expanded
							? `solid 0.12em ${colors.accent}`
							: `solid 0.12em ${colors.bgSidebar}`,
						cursor: 'pointer',
						WebkitTapHighlightColor: 'rgba(0,0,0,0)',
						border: 'none',
						background: 'transparent',
						width: '100%',
						padding: 0,
					}}
					onClick={toggleExplorer}
				>
					<Box
						sx={{
							...iconSx,
							my: 1.5,
							color: expanded ? colors.iconActive : colors.icon,
							outline: 'none',
						}}
						display='flex'
						justifyContent='center'
					>
						<VscFiles />
					</Box>
				</Box>

				<Divider sx={{ m: 0.5, borderColor: colors.divider }} />

				{contactLinks.map((link) => (
					<Tooltip title={link.title} arrow placement='right' key={link.index}>
						<Link
							target='_blank'
							rel='noopener noreferrer'
							href={link.href}
							underline='none'
							color='inherit'
							sx={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
						>
							<Box sx={{ ...iconSx, m: 0.5 }} display='flex' justifyContent='center'>
								<Box mt={0.7}>{link.icon}</Box>
							</Box>
						</Link>
					</Tooltip>
				))}
			</Box>

			<Box
				sx={{ flexGrow: 0, pb: 1 }}
				display='flex'
				gap={1}
				justifyContent='center'
				flexDirection='column'
			>
				{!isMobileViewport && (
					<Tooltip
						title={terminal ? t('sidebar.terminal.close') : t('sidebar.terminal.open')}
						placement='right'
						arrow
					>
						<Box
							component='button'
							aria-label={
								terminal
									? t('sidebar.terminal.close') || 'Close terminal'
									: t('sidebar.terminal.open') || 'Open terminal'
							}
							aria-expanded={terminal}
							tabIndex={0}
							onKeyDown={handleActivationKeyDown(toggleTerminal)}
							sx={{
								...iconSx,
								borderLeft: terminal
									? `solid 0.12em ${colors.accent}`
									: `solid 0.12em ${colors.bgSidebar}`,
								border: 'none',
								background: 'transparent',
								width: '100%',
								padding: 0,
							}}
							onClick={toggleTerminal}
							display='flex'
							justifyContent='center'
						>
							<Box sx={{ color: terminal ? colors.iconActive : colors.icon }}>
								<TerminalIcon />
							</Box>
						</Box>
					</Tooltip>
				)}
				<Tooltip title={t(languageKey)} placement='right' arrow>
					<Box
						component='button'
						aria-label={t(languageKey) || 'Change language'}
						tabIndex={0}
						onKeyDown={handleActivationKeyDown(changeLanguage)}
						sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
						display='flex'
						justifyContent='center'
						onClick={changeLanguage}
					>
						<LanguageIcon />
					</Box>
				</Tooltip>
				<Tooltip
					title={theme === 'dark' ? t('sidebar.theme.light') : t('sidebar.theme.dark')}
					placement='right'
					arrow
				>
					<Box
						component='button'
						aria-label={
							theme === 'dark'
								? t('sidebar.theme.light') || 'Switch to light theme'
								: t('sidebar.theme.dark') || 'Switch to dark theme'
						}
						tabIndex={0}
						onKeyDown={handleActivationKeyDown(toggleTheme)}
						sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
						display='flex'
						justifyContent='center'
						onClick={toggleTheme}
					>
						{theme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
					</Box>
				</Tooltip>
				<Box
					component='button'
					aria-label={t('sidebar.settings') || 'Settings'}
					tabIndex={0}
					sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
					display='flex'
					justifyContent='center'
				>
					<Box mt={0.7}>
						<VscSettingsGear />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
