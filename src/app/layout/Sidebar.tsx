import React from 'react';
import { Box, Link, Paper, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { VscFiles, VscSettingsGear } from 'react-icons/vsc';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Divider from '@mui/material/Divider';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Props {
	expanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	terminal: boolean;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	language: string;
	changeLanguage: () => void;
}

export default function Sidebar({
	expanded,
	setExpanded,
	terminal,
	setTerminal,
	language,
	changeLanguage,
}: Props) {
	const { theme, toggleTheme } = useTheme();
	const isDarkMode = theme === 'dark';
	const { t, i18n } = useTranslation();

	const contactLinks = [
		{
			index: 0,
			icon: <FaGithub />,
			title: t('contact.github.title'),
			href: t('contact.github.href'),
		},
		{
			index: 1,
			icon: <FaLinkedin />,
			title: t('contact.linkedin.title'),
			href: t('contact.linkedin.href'),
		},
		{
			index: 2,
			icon: <FaEnvelope />,
			title: t('contact.email.title'),
			href: t('contact.email.href'),
		},
	];

	return (
		<Box
			sx={{
				height: `calc(100vh - 20px)`,
				backgroundColor: isDarkMode ? '#343746' : '#2c2c2c',
			}}
			justifyContent='space-between'
			display='flex'
			flexDirection='column'
			component={Paper}
			square
			elevation={0}
		>
			<Box
				sx={{ flexGrow: 0 }}
				display='flex'
				justifyContent='center'
				flexDirection='column'
			>
				<Box
					sx={{
						borderLeft: expanded
							? 'solid 0.12em white'
							: isDarkMode
							? 'solid 0.12em #343746'
							: 'solid 0.12em #2c2c2c',
						cursor: 'pointer',
						WebkitTapHighlightColor: 'rgba(0,0,0,0)',
					}}
					onClick={() => setExpanded(!expanded)}
				>
					<Box
						sx={{
							flexGrow: 0,
							my: 1.5,
							color: expanded ? 'white' : '#6272a4',
							fontSize: 24,
							outline: 'none',
							'&:hover': {
								color: 'white',
							},
						}}
						display='flex'
						justifyContent='center'
					>
						<VscFiles />
					</Box>
				</Box>

				<Divider sx={{ m: 0.5 }} />

				{contactLinks.map((link) => (
					<Tooltip
						title={link.title}
						arrow
						placement='right'
						key={link.index}
					>
						<Link
							target='_blank'
							href={link.href}
							underline='none'
							color='inherit'
							sx={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
						>
							<Box
								sx={{
									flexGrow: 0,
									m: 0.5,
									color: '#6272a4',
									fontSize: 24,
									'&:hover': {
										color: 'white',
									},
									cursor: 'pointer',
								}}
								display='flex'
								justifyContent='center'
							>
								<Box mt={0.7}>{link.icon}</Box>
							</Box>
						</Link>
					</Tooltip>
				))}
			</Box>

			<Box
				sx={{ flexGrow: 0, pb: 0.5 }}
				display='flex'
				justifyContent='center'
				flexDirection='column'
			>
				<Tooltip
					title={
						terminal ? t('sidebar.terminal.close') : t('sidebar.terminal.open')
					}
					placement='right'
					arrow
				>
					<Box
						sx={{
							flexGrow: 0,
							fontSize: 24,
							color: '#6272a4',
							cursor: 'pointer',
							'&:hover': {
								color: 'white',
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
							borderLeft: terminal
								? 'solid 0.12em white'
								: isDarkMode
								? 'solid 0.12em #343746'
								: 'solid 0.12em #2c2c2c',
						}}
						onClick={() => setTerminal(!terminal)}
						display='flex'
						justifyContent='center'
					>
						<Box sx={{ color: terminal ? 'white' : '#6272a4' }}>
							<TerminalIcon />
						</Box>
					</Box>
				</Tooltip>
				<Tooltip
					title={t(
						`sidebar.language.to${
							i18n.language === 'pt' ? 'English' : 'Portuguese'
						}`
					)}
					placement='right'
					arrow
				>
					<Box
						sx={{
							flexGrow: 0,
							fontSize: 24,
							color: '#6272a4',
							cursor: 'pointer',
							'&:hover': {
								color: 'white',
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
						}}
						display='flex'
						justifyContent='center'
						onClick={changeLanguage}
					>
						<Box>
							<LanguageIcon />
						</Box>
					</Box>
				</Tooltip>
				<Tooltip
					title={
						isDarkMode ? t('sidebar.theme.light') : t('sidebar.theme.dark')
					}
					placement='right'
					arrow
				>
					<Box
						sx={{
							flexGrow: 0,
							fontSize: 24,
							color: '#6272a4',
							cursor: 'pointer',
							'&:hover': {
								color: 'white',
							},
							WebkitTapHighlightColor: 'rgba(0,0,0,0)',
						}}
						display='flex'
						justifyContent='center'
						onClick={toggleTheme}
					>
						{!isDarkMode ? (
							<Box>
								<DarkModeOutlinedIcon />
							</Box>
						) : (
							<Box>
								<LightModeOutlinedIcon />
							</Box>
						)}
					</Box>
				</Tooltip>
				<Box
					sx={{
						flexGrow: 0,
						fontSize: 24,
						color: '#6272a4',
						cursor: 'pointer',
						'&:hover': {
							color: 'white',
						},
						WebkitTapHighlightColor: 'rgba(0,0,0,0)',
					}}
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
