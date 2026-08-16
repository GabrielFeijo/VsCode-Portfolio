import { Box, Container, Grid } from '@mui/material';
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Page } from '@/domain/page';
import { StorageService } from '@/services/storageService';
import { getStaticPageContent } from '@/services/pageContentService';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

interface Props {
	path: string;
	page?: Page;
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

const DEFAULT_PAGE_NAMES = new Set([
	'about-me',
	'skills',
	'projects',
	'experience',
	'accomplishments',
	'certificates',
	'sobre-mim',
	'habilidades',
	'projetos',
	'experiencia',
	'conquistas',
	'certificados',
]);

function isDefaultPage(page?: Page): boolean {
	const baseName = page?.name.replace(/\.(html|md)$/, '').toLowerCase() || '';
	const baseRoute = page?.route.replace(/^\//, '').toLowerCase() || '';
	return DEFAULT_PAGE_NAMES.has(baseName) || DEFAULT_PAGE_NAMES.has(baseRoute);
}

function hasEditableContent(page?: Page): page is Page & { content?: string } {
	return !isDefaultPage(page) && Boolean(page && Object.prototype.hasOwnProperty.call(page, 'content'));
}

function getStoredPageContent(page?: Page): string | null {
	if (!page) return null;
	const baseName = page.name.replace(/\.(html|md)$/, '');
	const stored = StorageService.getData().find(
		(p) =>
			p.name === page.name ||
			p.name === `${baseName}.md` ||
			p.name === `${baseName}.html` ||
			p.name === baseName ||
			p.index === page.index ||
			p.route === page.route,
	);
	if (stored?.content !== undefined) {
		return stored.content;
	}
	if (page.content !== undefined) {
		return page.content;
	}
	return null;
}

export default function MDContainer({ path, page, setPages }: Props) {
	const [content, setContent] = useState('');
	const editMode = hasEditableContent(page);

	useEffect(() => {
		if (editMode) {
			setContent(page?.content || '');
			return;
		}

		let activeController: AbortController | null = null;

		const load = () => {
			const stored = getStoredPageContent(page);
			if (stored !== null) {
				setContent(stored);
				return;
			}

			const staticContent = getStaticPageContent(path);
			if (staticContent !== null) {
				setContent(staticContent);
				return;
			}

			activeController?.abort();
			const controller = new AbortController();
			activeController = controller;

			void fetch(path, {
				cache: 'force-cache',
				signal: controller.signal,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Failed to load content (${response.status})`);
					}
					return response.text();
				})
				.then(setContent)
				.catch((error: unknown) => {
					if (error instanceof DOMException && error.name === 'AbortError') return;
					setContent('# Error\n\nFailed to load content.');
				});
		};

		load();
		window.addEventListener('storage', load);
		return () => {
			activeController?.abort();
			window.removeEventListener('storage', load);
		};
	}, [editMode, page, path]);

	const handleChange = useCallback(
		(newContent: string) => {
			setContent(newContent);
			setPages((currentPages) =>
				currentPages.map((currentPage) =>
					currentPage.index === page!.index
						? { ...currentPage, content: newContent, isSaved: false }
						: currentPage
				)
			);
		},
		[page, setPages]
	);

	const handleSave = useCallback(() => {
		if (!page) return;

		const updatedPage = {
			...page,
			content,
			isSaved: true,
		};

		StorageService.saveOrUpdateData(updatedPage);

		setPages((currentPages) =>
			currentPages.map((currentPage) =>
				currentPage.index === page.index ? updatedPage : currentPage
			)
		);
	}, [content, page, setPages]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === 's') {
				event.preventDefault();
				handleSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleSave]);

	return (
		<Container
			maxWidth={false}
			sx={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				padding: '0 !important',
			}}
		>
			<Grid container sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
				{editMode && (
					<Grid
						item
						xs={12}
						md={6}
						sx={{
							height: '100%',
							borderRight: (theme) => `1px solid ${theme.palette.divider}`,
						}}
					>
						<Suspense fallback={<Box sx={{ p: 2 }}>Loading editor...</Box>}>
							<MarkdownEditor
								value={content}
								onChange={handleChange}
							/>
						</Suspense>
					</Grid>
				)}
				<Grid
					item
					xs={12}
					md={editMode ? 6 : 12}
					sx={{
						height: '100%',
						overflowY: 'auto',
						margin: 2,
					}}
				>
					<MarkdownRenderer content={content} allowRawHtml={true} />
				</Grid>
			</Grid>
		</Container>
	);
}
