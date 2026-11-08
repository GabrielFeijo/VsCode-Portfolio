import { LAYOUT } from '../constants/layout';

export interface MenuCoordinates {
	mouseX: number;
	mouseY: number;
}

export function clampMenuPosition(
	position: MenuCoordinates,
	menuWidth = LAYOUT.CONTEXT_MENU_WIDTH,
	menuHeight = LAYOUT.CONTEXT_MENU_HEIGHT,
): { top: number; left: number } {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	if (!viewportWidth || !viewportHeight) {
		return { top: position.mouseY, left: position.mouseX };
	}

	const maxLeft = Math.max(
		LAYOUT.VIEWPORT_PADDING,
		viewportWidth - menuWidth - LAYOUT.VIEWPORT_PADDING,
	);
	const maxTop = Math.max(
		LAYOUT.VIEWPORT_PADDING,
		viewportHeight - menuHeight - LAYOUT.VIEWPORT_PADDING,
	);

	return {
		left: Math.min(Math.max(LAYOUT.VIEWPORT_PADDING, position.mouseX), maxLeft),
		top: Math.min(Math.max(LAYOUT.VIEWPORT_PADDING, position.mouseY), maxTop),
	};
}
