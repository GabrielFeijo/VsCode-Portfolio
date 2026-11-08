import { Box, Typography } from '@mui/material';
import { TERMINAL_HOME, TERMINAL_USER } from '@/config/terminalIdentity';
import { useTheme } from '../../../../contexts/ThemeContext';
import { fonts } from '../../../theme/typography';
import { getTerminalColors } from './terminalConfig';

interface Props {
	cwd?: string;
	isDark?: boolean;
}

const TerminalPrompt = ({ cwd = '' }: Props) => {
	const { theme } = useTheme();
	const colors = getTerminalColors(theme);
	const displayPath = (cwd || '').replace(new RegExp(`^${TERMINAL_HOME}`), '~');

	return (
		<Box
			component='span'
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				flexWrap: 'nowrap',
				flexShrink: 0,
				fontFamily: fonts.mono,
				fontSize: '0.85rem',
				lineHeight: 1.6,
				whiteSpace: 'pre',
			}}
		>
			<Typography
				component='span'
				sx={{ color: colors.user, font: 'inherit', fontSize: 'inherit' }}
			>
				{TERMINAL_USER}
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.muted, font: 'inherit', fontSize: 'inherit' }}
			>
				@
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.host, font: 'inherit', fontSize: 'inherit' }}
			>
				portfolio
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.muted, font: 'inherit', fontSize: 'inherit' }}
			>
				{' '}
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.path, font: 'inherit', fontSize: 'inherit' }}
			>
				{displayPath}
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.muted, font: 'inherit', fontSize: 'inherit' }}
			>
				{' '}
			</Typography>
			<Typography component='span' sx={{ color: colors.git, font: 'inherit', fontSize: 'inherit' }}>
				main
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.muted, font: 'inherit', fontSize: 'inherit' }}
			>
				{' '}
			</Typography>
			<Typography
				component='span'
				sx={{ color: colors.arrow, font: 'inherit', fontSize: 'inherit', fontWeight: 'bold' }}
			>
				➜
			</Typography>
		</Box>
	);
};

export default TerminalPrompt;
