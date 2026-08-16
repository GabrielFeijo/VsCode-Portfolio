export function calculate(expression: string): number | null {
	const tokens: string[] = [];
	let i = 0;

	while (i < expression.length) {
		const ch = expression[i];
		if (/\s/.test(ch)) {
			i += 1;
			continue;
		}
		if (/[0-9.]/.test(ch)) {
			let num = '';
			while (i < expression.length && /[0-9.]/.test(expression[i])) {
				num += expression[i];
				i += 1;
			}
			tokens.push(num);
			continue;
		}
		if ('+-*/%^()'.includes(ch)) {
			tokens.push(ch);
			i += 1;
			continue;
		}
		return null;
	}

	let pos = 0;
	const peek = (): string | undefined => tokens[pos];
	const next = (): string | undefined => tokens[pos++];

	function parseFactor(): number {
		const token = next();
		if (token === '(') {
			const value = parseExpression();
			if (peek() !== ')') return NaN;
			next();
			return value;
		}
		if (token === '+' || token === '-') {
			const value = parseFactor();
			return token === '-' ? -value : value;
		}
		const num = Number(token);
		return Number.isFinite(num) ? num : NaN;
	}

	function parsePower(): number {
		const value = parseFactor();
		if (peek() === '^') {
			next();
			return Math.pow(value, parsePower());
		}
		return value;
	}

	function parseTerm(): number {
		let value = parsePower();
		while (peek() === '*' || peek() === '/' || peek() === '%') {
			const op = next();
			const rhs = parsePower();
			switch (op) {
				case '*':
					value *= rhs;
					break;
				case '/':
					value = rhs === 0 ? NaN : value / rhs;
					break;
				case '%':
					value %= rhs;
					break;
			}
		}
		return value;
	}

	function parseExpression(): number {
		let value = parseTerm();
		while (peek() === '+' || peek() === '-') {
			const op = next();
			const rhs = parseTerm();
			value = op === '+' ? value + rhs : value - rhs;
		}
		return value;
	}

	if (tokens.length === 0) return null;

	const result = parseExpression();
	if (pos !== tokens.length || Number.isNaN(result) || !Number.isFinite(result)) {
		return null;
	}
	return result;
}

export function formatResult(value: number): string {
	return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(6)));
}
