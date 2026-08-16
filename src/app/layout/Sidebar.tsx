import React, { useMemo } from 'react';
import { Box, Link, Paper, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { VscFiles, VscSettingsGear } from 'react-icons/vsc';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Divider from '@mui/material/Divider';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppPalette } from '../theme/useAppPalette';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { useLayoutContext } from '../../contexts/LayoutContext';

interface Props {
	language: string;
	changeLanguage: () => void;
}

export default function Sidebar({
	changeLanguage,
}: Props) {
	const { expanded, setExpanded, terminal, setTerminal } = useLayoutContext();
	const { theme, toggleTheme } = useTheme();
	const colors = useAppPalette();
	const { t, i18n } = useTranslation();

	const contactLinks = useMemo(
		() => [
			{ index: 0, icon: <FaGithub />, title: t('contact.github.title'), href: t('contact.github.href') },
			{ index: 1, icon: <FaLinkedin />, title: t('contact.linkedin.title'), href: t('contact.linkedin.href') },
			{ index: 2, icon: <FaEnvelope />, title: t('contact.email.title'), href: t('contact.email.href') },
		],
		[t],
	);

	const iconSx = {
		flexGrow: 0,
		fontSize: 24,
		color: colors.icon,
		cursor: 'pointer',
		'&:hover': { color: colors.iconActive },
	};

	return (
		<Box
			sx={{ height: '100%', backgroundColor: colors.bgSidebar }}
			justifyContent='space-between'
			display='flex'
			flexDirection='column'
			component={Paper}
			square
			elevation={0}
		>
			<Box sx={{ flexGrow: 0 }} display='flex' justifyContent='center' flexDirection='column'>
				<Box
					component="button"
					aria-label={expanded ? (t('sidebar.closeExplorer') || 'Close explorer') : (t('sidebar.openExplorer') || 'Open explorer')}
					aria-expanded={expanded}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							setExpanded(!expanded);
						}
					}}
					sx={{
						borderLeft: expanded ? `solid 0.12em ${colors.accent}` : `solid 0.12em ${colors.bgSidebar}`,
						cursor: 'pointer',
						WebkitTapHighlightColor: 'rgba(0,0,0,0)',
						border: 'none',
						background: 'transparent',
						width: '100%',
						padding: 0,
					}}
					onClick={() => setExpanded(!expanded)}
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

			<Box sx={{ flexGrow: 0, pb: 1 }} display='flex' gap={1} justifyContent='center' flexDirection='column'>
				{!isMobile && (
					<Tooltip title={terminal ? t('sidebar.terminal.close') : t('sidebar.terminal.open')} placement='right' arrow>
						<Box
							component="button"
							aria-label={terminal ? (t('sidebar.terminal.close') || 'Close terminal') : (t('sidebar.terminal.open') || 'Open terminal')}
							aria-expanded={terminal}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									setTerminal(!terminal);
								}
							}}
							sx={{
								...iconSx,
								borderLeft: terminal ? `solid 0.12em ${colors.accent}` : `solid 0.12em ${colors.bgSidebar}`,
								border: 'none',
								background: 'transparent',
								width: '100%',
								padding: 0,
							}}
							onClick={() => setTerminal(!terminal)}
							display='flex'
							justifyContent='center'
						>
							<Box sx={{ color: terminal ? colors.iconActive : colors.icon }}>
								<TerminalIcon />
							</Box>
						</Box>
					</Tooltip>
				)}
				<Tooltip title={t(`sidebar.language.to${i18n.language === 'pt' ? 'English' : 'Portuguese'}`)} placement='right' arrow>
					<Box
						component="button"
						aria-label={t(`sidebar.language.to${i18n.language === 'pt' ? 'English' : 'Portuguese'}`) || 'Change language'}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								changeLanguage();
							}
						}}
						sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
						display='flex'
						justifyContent='center'
						onClick={changeLanguage}
					>
						<LanguageIcon />
					</Box>
				</Tooltip>
				<Tooltip title={theme === 'dark' ? t('sidebar.theme.light') : t('sidebar.theme.dark')} placement='right' arrow>
					<Box
						component="button"
						aria-label={theme === 'dark' ? (t('sidebar.theme.light') || 'Switch to light theme') : (t('sidebar.theme.dark') || 'Switch to dark theme')}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleTheme();
							}
						}}
						sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
						display='flex'
						justifyContent='center'
						onClick={toggleTheme}
					>
						{theme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
					</Box>
				</Tooltip>
				<Box
					component="button"
					aria-label={t('sidebar.settings') || 'Settings'}
					tabIndex={0}
					sx={{ ...iconSx, border: 'none', background: 'transparent', width: '100%', padding: 0 }}
					display='flex'
					justifyContent='center'
				>
					<Box mt={0.7}><VscSettingsGear /></Box>
				</Box>
			</Box>
		</Box>
	);
}
