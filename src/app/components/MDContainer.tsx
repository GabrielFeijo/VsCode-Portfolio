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
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

interface Props {
	path: string;
	page?: Page;
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

function hasEditableContent(page?: Page): page is Page & { content?: string } {
	return Boolean(page && Object.prototype.hasOwnProperty.call(page, 'content'));
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
			const baseName = page?.name.replace(/\.(html|md)$/, '');
			const stored = StorageService.getData().find(
				(p) =>
					page &&
					(p.name === page.name ||
						p.name === `${baseName}.md` ||
						p.name === baseName ||
						p.index === page.index ||
						p.route === page.route),
			);
			if (stored?.content !== undefined) {
				setContent(stored.content);
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
					}}
				>
					<MarkdownRenderer content={content} allowRawHtml={!editMode} />
				</Grid>
			</Grid>
		</Container>
	);
}
