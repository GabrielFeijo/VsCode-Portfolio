import { Box, Typography } from '@mui/material';
import { useTheme } from '../../../../contexts/theme-context';
import { fonts } from '../../../theme/typography';
import { parseAnsiLine } from './parse-ansi-line';
import { getTerminalColors } from './terminal-config';

interface TerminalLineProps {
	lines: string[];
	color?: string;
}

const TerminalLine = ({ lines, color }: TerminalLineProps) => {
	const { theme } = useTheme();
	const colors = getTerminalColors(theme);
	const defaultColor = color || colors.text;

	return (
		<Box sx={{ mb: 0.5 }}>
			{Array.from(lines.entries()).map(([lineId, line]) => {
				const segments = parseAnsiLine(line, defaultColor, theme);
				return (
					<Typography
						key={lineId}
						component='div'
						sx={{
							fontFamily: fonts.mono,
							fontSize: '0.85rem',
							lineHeight: 1.6,
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-word',
							m: 0,
						}}
					>
						{Array.from(segments.entries()).map(([segmentId, seg]) => (
							<Box key={segmentId} component='span' sx={{ color: seg.color }}>
								{seg.text}
							</Box>
						))}
					</Typography>
				);
			})}
		</Box>
	);
};

export default TerminalLine;
