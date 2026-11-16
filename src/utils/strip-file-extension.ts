export function stripFileExtension(fileName: string): string {
	return fileName.replace(/\.(html|md)$/i, '');
}
