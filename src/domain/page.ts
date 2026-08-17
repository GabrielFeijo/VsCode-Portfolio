import { z } from 'zod';

export const supportedLanguages = ['pt', 'en'] as const;

export type Language = (typeof supportedLanguages)[number];

export const pageSchema: z.ZodType<Page> = z.lazy(() =>
	z.object({
		index: z.number().finite(),
		name: z.string(),
		route: z.string(),
		content: z.string().optional(),
		isSaved: z.boolean().optional(),
		isFolder: z.boolean().optional(),
		children: z.array(pageSchema).optional(),
	})
);

export interface Page {
	index: number;
	name: string;
	route: string;
	content?: string;
	isSaved?: boolean;
	isFolder?: boolean;
	children?: Page[];
}

export function isLanguage(value: string): value is Language {
	return supportedLanguages.includes(value as Language);
}

export function isPage(value: unknown): value is Page {
	return pageSchema.safeParse(value).success;
}
