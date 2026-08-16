function highlightLine(line: string, ext: string): string {
	if (ext === 'json') {
		return line
			.replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '\x1b[36m$1\x1b[0m$2')
			.replace(/(:\s*)("(?:\\.|[^"\\])*")/g, '$1\x1b[32m$2\x1b[0m')
			.replace(/(:\s*)(-?\d+(?:\.\d+)?)/g, '$1\x1b[33m$2\x1b[0m')
			.replace(/(:\s*)(true|false|null)/g, '$1\x1b[35m$2\x1b[0m');
	}

	if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
		if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
			return `\x1b[90m${line}\x1b[0m`;
		}

		let result = line;
		result = result.replace(
			/\b(import|export|from|const|let|var|function|return|if|else|switch|case|break|for|while|do|async|await|try|catch|finally|throw|new|typeof|instanceof|class|interface|type|extends|implements|default)\b/g,
			'\x1b[35m$1\x1b[0m',
		);
		result = result.replace(
			/\b(true|false|null|undefined|NaN|Infinity)\b/g,
			'\x1b[33m$1\x1b[0m',
		);
		result = result.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '\x1b[32m$&\x1b[0m');
		return result;
	}

	if (['html', 'xml', 'svg'].includes(ext)) {
		if (line.trim().startsWith('<!--')) {
			return `\x1b[90m${line}\x1b[0m`;
		}
		return line
			.replace(/(<\/?)([a-zA-Z0-9\-]+)/g, '$1\x1b[34m$2\x1b[0m')
			.replace(/([a-zA-Z\-]+)=("[^"]*")/g, '\x1b[36m$1\x1b[0m=\x1b[32m$2\x1b[0m');
	}

	if (['css', 'scss', 'sass'].includes(ext)) {
		if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
			return `\x1b[90m${line}\x1b[0m`;
		}
		return line
			.replace(/([a-zA-Z\-]+)(\s*:)/g, '\x1b[36m$1\x1b[0m$2')
			.replace(/(:\s*)([^;]+)(;?)/g, '$1\x1b[32m$2\x1b[0m$3');
	}

	if (['md', 'markdown'].includes(ext)) {
		if (line.startsWith('#')) {
			return `\x1b[1;36m${line}\x1b[0m`;
		}
		if (line.startsWith('- ') || line.startsWith('* ')) {
			return `\x1b[33m${line.slice(0, 2)}\x1b[0m${line.slice(2)}`;
		}
		return line.replace(/(`[^`]+`)/g, '\x1b[32m$1\x1b[0m');
	}

	if (['yml', 'yaml'].includes(ext)) {
		if (line.trim().startsWith('#')) {
			return `\x1b[90m${line}\x1b[0m`;
		}
		return line.replace(/^(\s*[^:]+)(:)/, '\x1b[36m$1\x1b[0m$2');
	}

	return line;
}

export interface FormatFileOptions {
	plain?: boolean;
	showLineNumbers?: boolean;
}

export function formatFileContent(
	fileName: string,
	contentLines: string[],
	options: FormatFileOptions = {},
): string[] {
	const { plain = false, showLineNumbers = true } = options;

	if (plain) {
		return contentLines;
	}

	const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';
	const totalLines = contentLines.length;

	const gutterWidth = Math.max(3, String(totalLines).length);
	const headerBorder = '─'.repeat(gutterWidth + 2);
	const contentBorder = '─'.repeat(54);

	const output: string[] = [];

	output.push(`\x1b[90m${headerBorder}┬${contentBorder}\x1b[0m`);
	output.push(
		`\x1b[90m${' '.repeat(gutterWidth + 2)}│\x1b[0m \x1b[1;36mFile:\x1b[0m \x1b[1;37m${fileName}\x1b[0m \x1b[90m(${totalLines} lines)\x1b[0m`,
	);
	output.push(`\x1b[90m${headerBorder}┼${contentBorder}\x1b[0m`);

	for (let i = 0; i < totalLines; i++) {
		const lineNum = i + 1;
		const highlighted = highlightLine(contentLines[i], ext);

		if (showLineNumbers) {
			const paddedNum = String(lineNum).padStart(gutterWidth, ' ');
			output.push(`\x1b[90m ${paddedNum} │ \x1b[0m${highlighted}`);
		} else {
			output.push(`\x1b[90m   │ \x1b[0m${highlighted}`);
		}
	}

	output.push(`\x1b[90m${headerBorder}┴${contentBorder}\x1b[0m`);

	return output;
}
