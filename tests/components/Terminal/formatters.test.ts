import {
	buildHelp,
	buildNeofetch,
	formatReviews,
	formatUptime,
} from '../../../src/app/components/Terminal/terminal/utils/formatters';

describe('formatters', () => {
	it('formats uptime in seconds and minutes', () => {
		const startRecent = Date.now() - 5000;
		expect(formatUptime(startRecent)).toBe('5 sec');

		const startOlder = Date.now() - 125000;
		expect(formatUptime(startOlder)).toBe('2 min, 5 sec');
	});

	it('builds neofetch output for dark and light theme and languages', () => {
		const darkPt = buildNeofetch({ isDark: true, language: 'pt', uptime: '1 min, 0 sec' });
		expect(darkPt.some((line) => line.includes('Dracula / Catppuccin'))).toBe(true);
		expect(darkPt.some((line) => line.includes('Português (BR)'))).toBe(true);

		const lightEn = buildNeofetch({ isDark: false, language: 'en', uptime: '10 sec' });
		expect(lightEn.some((line) => line.includes('Light'))).toBe(true);
		expect(lightEn.some((line) => line.includes('English (US)'))).toBe(true);
	});

	it('builds help output containing key categories', () => {
		const help = buildHelp();
		expect(help.some((line) => line.includes('Portfolio Terminal'))).toBe(true);
		expect(help.some((line) => line.includes('neofetch'))).toBe(true);
	});

	it('formats reviews when empty and when populated', () => {
		const t = (key: string) => key;
		expect(formatReviews([], t)).toEqual(['terminal.info.noReviews']);

		const reviews = formatReviews(
			[
				{
					_id: '1',
					username: 'Alice',
					comment: 'Great portfolio!',
					stars: 5,
					createdAt: '2026-01-01T12:00:00Z',
					updatedAt: '2026-01-01T12:00:00Z',
				},
			],
			t,
		);
		expect(reviews[0]).toContain('[Alice]');
		expect(reviews[0]).toContain('Great portfolio!');
		expect(reviews[0]).toContain('★ 5');
	});
});
