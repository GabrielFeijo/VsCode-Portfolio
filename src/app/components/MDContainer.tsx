import { Box, Container, Grid } from '@mui/material';
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Page } from '../../domain/page';
import { StorageService } from '../../services/storageService';
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
			setContent(page.content || '');
			return;
		}

		const controller = new AbortController();
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

		return () => controller.abort();
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

	useEffect(() => {
		function savePage(event: KeyboardEvent) {
			if (!event.ctrlKey || event.key.toLowerCase() !== 's' || !editMode) return;

			event.preventDefault();
			const updatedPage = { ...page, content, isSaved: true };
			StorageService.saveOrUpdateData(updatedPage);
			setPages((currentPages) =>
				currentPages.map((currentPage) =>
					currentPage.index === page.index ? updatedPage : currentPage
				)
			);
		}

		window.addEventListener('keydown', savePage);
		return () => window.removeEventListener('keydown', savePage);
	}, [content, editMode, page, setPages]);

	return (
		<Container
			sx={{
				height: '100%',
				padding: { xs: 1, sm: 2, md: 3 },
				'& h1, & h2, & h3': { wordBreak: 'break-word' },
				'& p, & li': {
					wordBreak: 'break-word',
					overflowWrap: 'break-word',
				},
				'& img': { maxWidth: '100%', height: 'auto' },
			}}
		>
			{editMode ? (
				<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					<Grid
						container
						sx={{ height: '100%', pt: 2, pb: 2 }}
					>
						<Grid
							item
							xs={5}
							sx={{ pt: 2 }}
						>
							<Suspense fallback={null}>
								<MarkdownEditor
									value={content}
									onChange={handleChange}
								/>
							</Suspense>
						</Grid>

						<Grid
							item
							xs={7}
							sx={{ pl: 2, borderLeft: '1px solid #8686867b' }}
						>
							<MarkdownRenderer content={content} />
						</Grid>
					</Grid>
				</Box>
			) : (
				<MarkdownRenderer
					content={content}
					allowRawHtml
				/>
			)}
		</Container>
	);
}
