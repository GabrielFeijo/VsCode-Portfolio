/**
 * Strips known markdown and html file extensions (.md, .html) from a file name or path.
 * If no known extension is found, removes any trailing file extension if removeAnyExtension is true.
 */
export function stripFileExtension(fileName: string): string {
	return fileName.replace(/\.(html|md)$/i, '');
}
