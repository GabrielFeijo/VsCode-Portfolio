import { StorageService } from '@/services/storageService';
import { fetchFileContent } from '@/services/terminal/remoteFileService';
import { stripFileExtension } from '@/utils/stripFileExtension';
import { isSamePageName } from '@/utils/pageName';
import { VirtualDirectory } from '../types';

export function hasContent(lines: string[] | undefined): lines is string[] {
	return lines != null && lines.length > 0 && lines.some((l) => l.length > 0);
}

export async function getFileLinesAsync(
	fs: VirtualDirectory,
	parent: string,
	fileName: string,
	language = 'pt',
): Promise<string[] | null> {
	const baseName = stripFileExtension(fileName);
	const stored = StorageService.getData().find((p) => isSamePageName(p.name, fileName));
	if (stored?.content !== undefined) {
		return stored.content.split('\n');
	}

	const siblings = fs[parent] ?? [];
	const findFile = (name: string) => siblings.find((e) => e.name === name && e.type === 'file');

	const exact = findFile(fileName);
	for (const candidate of [exact, findFile(`${baseName}.html`), findFile(`${baseName}.md`)]) {
		const lines = candidate?.content;
		if (lines && hasContent(lines)) return lines;
	}

	const remote = await fetchFileContent(fileName, language);
	if (remote !== null) {
		const lines = remote.split('\n');
		if (exact) {
			exact.content = lines;
		}
		return lines;
	}

	return null;
}
