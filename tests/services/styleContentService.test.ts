import { getStyleContent } from '../../src/services/styleContentService';
import { STYLE_FILES } from '../mocks/styleContentGlob';

describe('styleContentService', () => {
	beforeEach(() => {
		for (const key of Object.keys(STYLE_FILES)) {
			delete STYLE_FILES[key];
		}
	});

	it('returns null for empty or missing stylesheet hrefs', () => {
		expect(getStyleContent('')).toBeNull();
		expect(getStyleContent('/missing.css')).toBeNull();
	});

	it('returns matching css content based on filename', () => {
		STYLE_FILES['../styles/about.css'] = '.header { display: flex; }';
		STYLE_FILES['../styles/projects.css'] = '.line { height: 35px; }';

		expect(getStyleContent('../../styles/about.css')).toBe('.header { display: flex; }');
		expect(getStyleContent('/styles/about.css')).toBe('.header { display: flex; }');
		expect(getStyleContent('about.css')).toBe('.header { display: flex; }');
		expect(getStyleContent('styles/projects.css')).toBe('.line { height: 35px; }');
		expect(getStyleContent('styles/unknown.css')).toBeNull();
	});
});
