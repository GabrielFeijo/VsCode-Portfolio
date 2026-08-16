export interface ParsedCommandArgs {
	flags: Set<string>;
	args: string[];
}

export function parseFlagsAndArgs(rawArgs: string): ParsedCommandArgs {
	const flags = new Set<string>();
	const args: string[] = [];
	const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(rawArgs)) !== null) {
		const isQuoted = match[1] !== undefined || match[2] !== undefined;
		const token = match[1] ?? match[2] ?? match[0];

		if (!isQuoted && token.startsWith('-') && token.length > 1 && !/^\d/.test(token.slice(1))) {
			for (const char of token.slice(1)) {
				flags.add(char);
			}
		} else {
			args.push(token);
		}
	}

	return { flags, args };
}
