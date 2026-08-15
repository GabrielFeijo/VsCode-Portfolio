import { Theme } from '../../../../contexts/ThemeContext';
import { getTerminalColors } from './terminalConfig';

function buildAnsiMap(mode: Theme): Record<string, string> {
	const c = getTerminalColors(mode);
	return {
		'30': c.muted,
		'31': c.error,
		'32': c.success,
		'33': c.warning,
		'34': c.info,
		'35': c.link,
		'36': c.host,
		'37': c.text,
		'90': c.muted,
		'91': c.error,
		'92': c.success,
		'93': c.warning,
		'94': c.path,
		'95': c.link,
		'96': c.host,
		'97': '#ffffff',
		'0': c.text,
	};
}

export interface ColoredSegment {
	text: string;
	color: string;
}

export function parseAnsiLine(
	line: string,
	defaultColor: string,
	mode: Theme = 'dark',
): ColoredSegment[] {
	const ansiMap = buildAnsiMap(mode);
	const segments: ColoredSegment[] = [];
	let currentColor = defaultColor;
	let buffer = '';
	let i = 0;

	while (i < line.length) {
		if (line[i] === '\x1b' && line[i + 1] === '[') {
			if (buffer) {
				segments.push({ text: buffer, color: currentColor });
				buffer = '';
			}
			const end = line.indexOf('m', i);
			if (end === -1) {
				buffer += line[i];
				i++;
				continue;
			}
			const code = line.slice(i + 2, end);
			currentColor = ansiMap[code] ?? defaultColor;
			i = end + 1;
			continue;
		}
		buffer += line[i];
		i++;
	}

	if (buffer) {
		segments.push({ text: buffer, color: currentColor });
	}

	return segments.length > 0 ? segments : [{ text: line, color: defaultColor }];
}
