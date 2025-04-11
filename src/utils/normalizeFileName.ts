export const normalizeFileName = (fileName: string): string => {
	const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
	const normalized = nameWithoutExtension
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
	const withHyphens = normalized.replace(/\s+/g, '-');
	const sanitized = withHyphens.replace(/[^a-zA-Z0-9-]/g, '');
	return sanitized.toLowerCase();
};
