import {
	Box,
	Divider,
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
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../../contexts/ThemeContext';

interface MarkdownRendererProps {
	allowRawHtml?: boolean;
	content: string;
}

const markdownPlugins = [remarkGfm, remarkBreaks];
const rawHtmlPlugins = [rehypeRaw];

function MarkdownLink(props: ComponentPropsWithoutRef<'a'>) {
	return (
		<Link
			href={props.href}
			target='_blank'
			rel='noopener noreferrer'
			underline='hover'
		>
			{props.children}
		</Link>
	);
}

function MarkdownImage(props: ComponentPropsWithoutRef<'img'>) {
	const isProfileImage = props.className?.split(' ').includes('profile');

	return (
		<img
			{...props}
			loading={isProfileImage ? 'eager' : 'lazy'}
			decoding='async'
		/>
	);
}

function MarkdownIframe(props: ComponentPropsWithoutRef<'iframe'>) {
	return (
		<iframe
			{...props}
			loading='lazy'
			title={props.title || 'Embedded content'}
		/>
	);
}

function MarkdownTable({ children }: { children: ReactNode }) {
	return (
		<TableContainer component={Paper}>
			<Table
				size='small'
				aria-label='Data table'
			>
				{children}
			</Table>
		</TableContainer>
	);
}

function MarkdownTableCell({ children }: { children: ReactNode }) {
	return <TableCell>{children}</TableCell>;
}

function MarkdownCode({
	children,
	className,
	isDarkTheme,
}: {
	children: ReactNode;
	className?: string;
	isDarkTheme: boolean;
}) {
	const language = className?.split('-')[1] || 'md';

	return (
		<Box
			component='pre'
			sx={{
				overflowX: 'auto',
				p: 2,
				borderRadius: 1,
				backgroundColor: isDarkTheme ? '#1e1e1e' : '#f5f5f5',
				color: isDarkTheme ? '#d4d4d4' : '#24292f',
				fontFamily: '"Fira Code", "Fira Mono", monospace',
				fontSize: 14,
			}}
		>
			<code className={`language-${language}`}>
				{String(children).replace(/\n$/, '')}
			</code>
		</Box>
	);
}

function MarkdownHeading({
	children,
	level,
}: {
	children: ReactNode;
	level: 1 | 2;
}) {
	return (
		<>
			<Typography
				component={`h${level}`}
				variant={`h${level}`}
				sx={{
					fontSize: level === 1 ? '2em' : '1.5em',
					display: 'block',
					marginBlockStart: level === 1 ? '0.67em' : '0.83em',
					marginBlockEnd: '0.3em',
					fontWeight: 'bold',
					lineHeight: 1.25,
				}}
			>
				{children}
			</Typography>
			<Divider />
		</>
	);
}

export default function MarkdownRenderer({
	allowRawHtml = false,
	content,
}: MarkdownRendererProps) {
	const { theme } = useTheme();
	const isDarkTheme = theme === 'dark';

	return (
		<ReactMarkdown
			components={{
				code: ({ children, className }) => (
					<MarkdownCode
						className={className}
						isDarkTheme={isDarkTheme}
					>
						{children}
					</MarkdownCode>
				),
				a: MarkdownLink,
				img: MarkdownImage,
				iframe: MarkdownIframe,
				table: MarkdownTable,
				thead: TableHead,
				tbody: TableBody,
				th: MarkdownTableCell,
				tr: TableRow,
				td: MarkdownTableCell,
				tfoot: TableFooter,
				h1: ({ children }) => (
					<MarkdownHeading level={1}>{children}</MarkdownHeading>
				),
				h2: ({ children }) => (
					<MarkdownHeading level={2}>{children}</MarkdownHeading>
				),
			}}
			remarkPlugins={markdownPlugins}
			rehypePlugins={allowRawHtml ? rawHtmlPlugins : []}
		>
			{content}
		</ReactMarkdown>
	);
}
