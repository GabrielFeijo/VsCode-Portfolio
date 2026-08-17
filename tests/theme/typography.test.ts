import { fonts } from '../../src/app/theme/typography';

describe('typography', () => {
	it('uses jetbrains mono only for monospace surfaces', () => {
		expect(fonts.mono).toContain('JetBrains Mono');
	});

	it('uses inter for readable ui and content text', () => {
		expect(fonts.ui).toContain('Inter');
		expect(fonts.content).toContain('Inter');
		expect(fonts.ui).not.toContain('JetBrains Mono');
		expect(fonts.content).not.toContain('JetBrains Mono');
	});
});
