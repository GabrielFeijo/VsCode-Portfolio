import {
	Box,
	Container,
	Divider,
	Grid,
	Link,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { ReactNode, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Page, StorageService } from '../../services/storageService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactSimpleCodeEditor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css'
import { useTheme } from '../../contexts/ThemeContext';


interface Props {
	path: string;
	page?: Page;
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

function MarkdownLink(props: any) {
	return (
		<Link
			href={props.href}
			target='_blank'
			underline='hover'
		>
			{props.children}
		</Link>
	);
}

function MarkdownTable(props: { children: ReactNode }) {
	return (
		<TableContainer component={Paper}>
			<Table
				size='small'
				aria-label='a dense table'
			>
				{props.children}
			</Table>
		</TableContainer>
	);
}

function MarkdownTableCell(props: { children: ReactNode }) {
	return (
		<TableCell>
			{props.children}
			{/* <Typography>{props.children}</Typography> */}
		</TableCell>
	);
}

function MarkdownCode(props: { children: ReactNode, className?: string }, isDarkTheme: boolean) {
	const language = props.className ? props.className.split('-')[1] : 'md';
	return (
		<SyntaxHighlighter language={language} style={isDarkTheme ? materialDark : materialLight}>
			{String(props.children).replace(/\n$/, '')}
		</SyntaxHighlighter>
	);
}

function MarkdownH1(props: { children: ReactNode }) {
	return (
		<>
			<Typography
				variant='h1'
				sx={{
					fontSize: '2em',
					display: 'block',
					marginBlockStart: '0.67em',
					marginBlockEnd: '0.3em',
					fontWeight: 'bold',
					lineHeight: 1.25,
				}}
			>
				{props.children}
			</Typography>
			<Divider />
		</>
	);
}

function MarkdownH2(props: { children: ReactNode }) {
	return (
		<>
			<Typography
				variant='h2'
				sx={{
					fontSize: '1.5em',
					display: 'block',
					marginBlockStart: '0.83em',
					marginBlockEnd: '0.3em',
					fontWeight: 'bold',
					lineHeight: 1.25,
				}}
			>
				{props.children}
			</Typography>
			<Divider />
		</>
	);
}

export default function MDContainer({ path, page, setPages }: Props) {
	const { theme } = useTheme();
	const isDarkTheme = theme === 'dark';
	const [content, setContent] = useState('');
	const [editMode, setEditMode] = useState(false);
	const { pathname } = useLocation();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (page && page.hasOwnProperty('content')) {
			setContent(page?.content || '');
			setEditMode(true);
			inputRef.current?.focus();
		} else {
			setEditMode(false);
			fetch(path)
				.then((res) => res.text())
				.then((text) => setContent(text));
		}
	}, [path, page, inputRef]);

	useEffect(() => {
		let title = pathname.substring(1, pathname.length);
		title = title[0].toUpperCase() + title.substring(1);
		document.title = `${process.env.REACT_APP_NAME!} | ${title}`;
	}, [pathname]);

	const handleChange = (code: string) => {
		const newContent = String(code);
		setContent(newContent);
		if (page) {
			setPages((prev) => prev.map(p => p.index === page.index ? { ...p, content: newContent, isSaved: false } : p));
		}
	};

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.ctrlKey && e.key.toLowerCase() === 's') {
				e.preventDefault();
				if (page && page.hasOwnProperty('content')) {
					const updatedPage = { ...page, content, isSaved: true };
					StorageService.saveOrUpdateData(updatedPage);
					setPages((prev) => prev.map(p => p.index === page.index ? updatedPage : p));
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [path, page, content]);

	return (
		<Container sx={{ height: '100%' }}>
			{editMode ? (
				<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					<Grid container sx={{ height: '100%', pt: 2, pb: 2 }}>
						<Grid item xs={5} sx={{ pt: 2 }}>
							<ReactSimpleCodeEditor
								value={content}
								onValueChange={(code) => {
									handleChange(code)
								}}
								highlight={(code) => highlight(code, languages.markdown, 'markdown')}
								style={{
									fontFamily: '"Fira code", "Fira Mono", monospace',
									fontSize: 14,
									lineHeight: '1.5',
									height: '100%',
								}}
								textareaClassName="code-editor-textarea"
								preClassName="code-editor-pre"
							/>
						</Grid>

						<Grid item xs={7} sx={{ pl: 2, borderLeft: '1px solid #8686867b' }}>
							<ReactMarkdown
								children={content}
								components={{
									code: (props: { children: ReactNode, className?: string }) => MarkdownCode(props, isDarkTheme),
									a: MarkdownLink,
									table: MarkdownTable,
									thead: TableHead,
									tbody: TableBody,
									th: MarkdownTableCell,
									tr: TableRow,
									td: MarkdownTableCell,
									tfoot: TableFooter,
									h1: MarkdownH1,
									h2: MarkdownH2,
								}}
								remarkPlugins={[remarkGfm, remarkBreaks]}
								rehypePlugins={[rehypeRaw]}
							/>
						</Grid>
					</Grid>
				</Box>
			) : (
				<ReactMarkdown
					children={content}
					components={{
						code: (props: { children: ReactNode, className?: string }) => MarkdownCode(props, isDarkTheme),
						a: MarkdownLink,
						table: MarkdownTable,
						thead: TableHead,
						tbody: TableBody,
						th: MarkdownTableCell,
						tr: TableRow,
						td: MarkdownTableCell,
						tfoot: TableFooter,
						h1: MarkdownH1,
						h2: MarkdownH2,
					}}
					remarkPlugins={[remarkGfm, remarkBreaks]}
					rehypePlugins={[rehypeRaw]}
				/>
			)
			}
		</Container >
	);
}