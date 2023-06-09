import React from 'react';
import { Box, Link, Paper, Tooltip } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import TerminalIcon from '@mui/icons-material/TerminalOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { VscFiles, VscSettingsGear } from 'react-icons/vsc';
import { BiGitBranch } from 'react-icons/bi';
import Divider from '@mui/material/Divider';
import { contact, contato } from '../pages/links';

interface Props {
	expanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	terminal: boolean;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	darkMode: boolean;
	handleThemeChange: () => void;
	language: string;
	changeLanguage: () => void;
}

export default function Sidebar({
	expanded,
	setExpanded,
	terminal,
	setTerminal,
	darkMode,
	handleThemeChange,
	language,
	changeLanguage,
}: Props) {
	const links = language === 'pt-BR' ? contato : contact;
	return (
		<Box
			sx={{
				height: `calc(100vh - 20px)`,
				backgroundColor: darkMode ? '#343746' : '#2c2c2c',
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
							: darkMode
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
				<Tooltip
					title={
						language === 'pt-BR'
							? 'Código deste projeto'
							: 'Source of this project'
					}
					arrow
					placement='right'
				>
					<Link
						target='_blank'
						href={'https://github.com/GabrielFeijo'}
						underline='none'
						color='inherit'
						sx={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
					>
						<Box
							sx={{
								flexGrow: 0,
								cursor: 'pointer',
								color: '#6272a4',
								fontSize: 24,
								'&:hover': {
									color: 'white',
								},
							}}
							display='flex'
							justifyContent='center'
						>
							<Box mt={0.7}>
								<BiGitBranch />
							</Box>
						</Box>
					</Link>
				</Tooltip>

				<Divider sx={{ m: 0.5 }} />

				{links.map((link) => (
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
						language === 'pt-BR'
							? terminal
								? 'Fechar Terminal'
								: 'Abrir Terminal'
							: terminal
							? 'Close Terminal'
							: 'Open Terminal'
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
								: darkMode
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
					title={
						language === 'pt-BR'
							? 'Alterar para o inglês'
							: 'Change to portuguese'
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
						onClick={changeLanguage}
					>
						<Box>
							<LanguageIcon />
						</Box>
					</Box>
				</Tooltip>
				<Tooltip
					title={
						language === 'pt-BR'
							? darkMode
								? 'Modo Claro'
								: 'Modo Escuro'
							: darkMode
							? 'Turn on the light'
							: 'Turn off the light'
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
						onClick={handleThemeChange}
					>
						{!darkMode ? (
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
