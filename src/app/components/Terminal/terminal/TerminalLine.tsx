import { Box, Typography } from '@mui/material';
import { useTheme } from '../../../../contexts/ThemeContext';
import { fonts } from '../../../theme/typography';
import { parseAnsiLine } from './parseAnsiLine';
import { getTerminalColors } from './terminalConfig';

interface Props {
	lines: string[];
	color?: string;
}

const TerminalLine = ({ lines, color }: Props) => {
	const { theme } = useTheme();
	const colors = getTerminalColors(theme);
	const defaultColor = color || colors.text;

	return (
		<Box sx={{ mb: 0.5 }}>
			{lines.map((line, lineIndex) => {
				const segments = parseAnsiLine(line, defaultColor, theme);
				return (
					<Typography
						key={lineIndex}
						component="div"
						sx={{
							fontFamily: fonts.mono,
							fontSize: '0.85rem',
							lineHeight: 1.6,
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-word',
							m: 0,
						}}
					>
						{segments.map((seg, segIndex) => (
							<Box
								key={segIndex}
								component="span"
								sx={{ color: seg.color }}
							>
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
