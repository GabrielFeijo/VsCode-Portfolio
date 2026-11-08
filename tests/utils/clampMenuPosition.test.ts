import { clampMenuPosition } from '../../src/utils/clampMenuPosition';

describe('clampMenuPosition', () => {
	const originalInnerWidth = window.innerWidth;
	const originalInnerHeight = window.innerHeight;

	afterEach(() => {
		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			writable: true,
			value: originalInnerWidth,
		});
		Object.defineProperty(window, 'innerHeight', {
			configurable: true,
			writable: true,
			value: originalInnerHeight,
		});
	});

	it('keeps coordinates unchanged when well inside the viewport', () => {
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });

		expect(clampMenuPosition({ mouseX: 100, mouseY: 200 })).toEqual({
			left: 100,
			top: 200,
		});
	});

	it('clamps coordinates when near the right or bottom edge on mobile viewports', () => {
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 667 });

		expect(clampMenuPosition({ mouseX: 350, mouseY: 640 })).toEqual({
			left: 153,
			top: 475,
		});
	});

	it('enforces minimum viewport padding when coordinates are near 0', () => {
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 667 });

		expect(clampMenuPosition({ mouseX: 2, mouseY: 4 })).toEqual({
			left: 12,
			top: 12,
		});
	});

	it('falls back to raw coordinates when viewport dimensions are 0', () => {
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 0 });

		expect(clampMenuPosition({ mouseX: 50, mouseY: 80 })).toEqual({
			left: 50,
			top: 80,
		});
	});
});
