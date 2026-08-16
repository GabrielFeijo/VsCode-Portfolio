import { StorageService } from '@/services/storageService';
import { fetchFileContent } from '@/services/terminal/remoteFileService';
import { stripFileExtension } from '@/utils/stripFileExtension';
import { VirtualDirectory } from '../types';

export function hasContent(lines: string[] | undefined): boolean {
	return lines != null && lines.length > 0 && lines.some((l) => l.length > 0);
}

export async function getFileLinesAsync(
	fs: VirtualDirectory,
	parent: string,
	fileName: string,
	language = 'pt',
): Promise<string[] | null> {
	const baseName = stripFileExtension(fileName);
	const stored = StorageService.getData().find(
		(p) =>
			p.name === fileName ||
			p.name === `${baseName}.md` ||
			p.name === `${baseName}.html` ||
			p.name === baseName ||
			p.route === baseName,
	);
	if (stored?.content !== undefined) {
		return stored.content.split('\n');
	}

	const exact = fs[parent]?.find((e) => e.name === fileName && e.type === 'file');
	if (hasContent(exact?.content)) {
		return exact!.content!;
	}

	const altHtml = fs[parent]?.find((e) => e.name === `${baseName}.html` && e.type === 'file');
	if (hasContent(altHtml?.content)) {
		return altHtml!.content!;
	}

	const altMd = fs[parent]?.find((e) => e.name === `${baseName}.md` && e.type === 'file');
	if (hasContent(altMd?.content)) {
		return altMd!.content!;
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
