import { calculate, formatResult } from '../../../src/app/components/Terminal/terminal/utils/calculator';

describe('calculator', () => {
	it('calculates simple arithmetic expressions', () => {
		expect(calculate('2 + 2')).toBe(4);
		expect(calculate('10 - 3')).toBe(7);
		expect(calculate('4 * 5')).toBe(20);
		expect(calculate('20 / 4')).toBe(5);
		expect(calculate('10 % 3')).toBe(1);
		expect(calculate('2 ^ 3')).toBe(8);
	});

	it('respects operator precedence and parentheses', () => {
		expect(calculate('2 + 3 * 4')).toBe(14);
		expect(calculate('(2 + 3) * 4')).toBe(20);
		expect(calculate('2 ^ 3 ^ 2')).toBe(512);
	});

	it('handles unary plus and minus and floats', () => {
		expect(calculate('-5 + +3')).toBe(-2);
		expect(calculate('-(2 + 3)')).toBe(-5);
		expect(calculate('2.5 * 2')).toBe(5);
	});

	it('returns null for empty or invalid expressions', () => {
		expect(calculate('')).toBeNull();
		expect(calculate('abc')).toBeNull();
		expect(calculate('2 +')).toBeNull();
		expect(calculate('(2 + 3')).toBeNull();
		expect(calculate('5 / 0')).toBeNull();
		expect(calculate('2 ++ 2')).toBe(4);
	});

	it('formats integer and float results correctly', () => {
		expect(formatResult(42)).toBe('42');
		expect(formatResult(3.1415926535)).toBe('3.141593');
	});
});
