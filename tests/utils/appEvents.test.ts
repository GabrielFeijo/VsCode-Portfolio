import {
	notifyStorageChange,
	onOpenTabRequest,
	onStorageChange,
	requestOpenTab,
} from '../../src/utils/appEvents';

describe('appEvents', () => {
	it('delivers open tab requests to listeners until unsubscribed', () => {
		const listener = jest.fn();
		const unsubscribe = onOpenTabRequest(listener);

		requestOpenTab('skills.md');
		expect(listener).toHaveBeenCalledWith('skills.md');

		unsubscribe();
		requestOpenTab('projects.md');
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('ignores open tab events without a target', () => {
		const listener = jest.fn();
		const unsubscribe = onOpenTabRequest(listener);

		window.dispatchEvent(new CustomEvent('open-tab'));
		window.dispatchEvent(new CustomEvent('open-tab', { detail: {} }));

		expect(listener).not.toHaveBeenCalled();
		unsubscribe();
	});

	it('delivers storage notifications until unsubscribed', () => {
		const listener = jest.fn();
		const unsubscribe = onStorageChange(listener);

		notifyStorageChange();
		expect(listener).toHaveBeenCalledTimes(1);

		unsubscribe();
		notifyStorageChange();
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
