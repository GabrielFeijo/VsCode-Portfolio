import { parseFlagsAndArgs } from '@/app/components/Terminal/terminal/utils/commandArgs';

describe('parseFlagsAndArgs', () => {
	it('parses single flags and multiple combined flags', () => {
		const result = parseFlagsAndArgs('-a -l');
		expect(result.flags.has('a')).toBe(true);
		expect(result.flags.has('l')).toBe(true);
		expect(result.args).toEqual([]);
	});

	it('parses combined flags like -la', () => {
		const result = parseFlagsAndArgs('-la targetDir');
		expect(result.flags.has('l')).toBe(true);
		expect(result.flags.has('a')).toBe(true);
		expect(result.args).toEqual(['targetDir']);
	});

	it('strips quotes from arguments and preserves non-flag tokens', () => {
		const result = parseFlagsAndArgs('-i "hello world" \'second arg\' -5');
		expect(result.flags.has('i')).toBe(true);
		expect(result.flags.has('5')).toBe(false);
		expect(result.args).toEqual(['hello world', 'second arg', '-5']);
	});
});
