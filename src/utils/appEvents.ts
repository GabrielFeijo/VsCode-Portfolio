const OPEN_TAB_EVENT = 'open-tab';
const STORAGE_EVENT = 'storage';

interface OpenTabDetail {
	target?: string;
}

export function requestOpenTab(target: string): void {
	window.dispatchEvent(new CustomEvent<OpenTabDetail>(OPEN_TAB_EVENT, { detail: { target } }));
}

export function onOpenTabRequest(listener: (target: string) => void): () => void {
	const handler = (event: Event) => {
		const target = (event as CustomEvent<OpenTabDetail>).detail?.target;
		if (target !== undefined) listener(target);
	};
	window.addEventListener(OPEN_TAB_EVENT, handler);
	return () => window.removeEventListener(OPEN_TAB_EVENT, handler);
}

export function notifyStorageChange(): void {
	window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function onStorageChange(listener: () => void): () => void {
	window.addEventListener(STORAGE_EVENT, listener);
	return () => window.removeEventListener(STORAGE_EVENT, listener);
}
