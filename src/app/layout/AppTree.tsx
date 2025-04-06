import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { VscMarkdown, VscNewFile, VscNewFolder, VscRefresh } from 'react-icons/vsc';
import { convertFileName } from '../utils/convertFileName';
import { useTranslation } from 'react-i18next';
import { Box, IconButton } from '@mui/material';
import { Page, StorageService } from '../../services/storageService';

interface Props {
	pages: Page[];
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	selectedIndex: number;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	currentComponent: string;
	setCurrentComponent: React.Dispatch<React.SetStateAction<string>>;
	visiblePageIndexes: number[];
	setVisiblePageIndexes: React.Dispatch<React.SetStateAction<number[]>>;
	language: string;
}

export default function AppTree({
	pages,
	setPages,
	selectedIndex,
	setSelectedIndex,
	currentComponent,
	setCurrentComponent,
	visiblePageIndexes,
	setVisiblePageIndexes,
}: Props) {
	const navigate = useNavigate();
	const theme = useTheme();
	const { t } = useTranslation();
	// const [selectedIndex, setSelectedIndex] = useState(-1);
	let { pathname } = useLocation();

	const page: Page = pages.find((x) => x.route === pathname)!;

	useEffect(() => {
		if (page) {
			setSelectedIndex(page.index);
		}
	}, [page, setSelectedIndex]);

	function renderTreeItemBgColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index ? '#313341' : '#21222c';
		} else {
			return selectedIndex === index ? '#295fbf' : '#f3f3f3';
		}
	}

	function renderTreeItemColor(index: number) {
		if (theme.palette.mode === 'dark') {
			return selectedIndex === index && currentComponent === 'tree'
				? 'white'
				: '#bdc3cf';
		} else {
			return selectedIndex === index ? '#e2ffff' : '#69665f';
		}
	}

	function handleCreateFile(e: React.MouseEvent) {
		e.stopPropagation();
		const fileName = prompt(t('prompts.enter_filename'));
		if (fileName) {
			const existingPage = pages.find(
				(x) => x.route === `${fileName}.md`.toLowerCase().replace(/\s+/g, '-')
			);

			if (existingPage) {
				return existingPage;
			}

			const newFile = StorageService.createFile(`${fileName}.md`);
			const updatedPages = [...pages, newFile];
			StorageService.saveData(updatedPages);
			setPages(updatedPages);
			setVisiblePageIndexes([...visiblePageIndexes, newFile.index]);
			setSelectedIndex(newFile.index);
			navigate(newFile.route);
		}
	};

	return (
		<TreeView
			aria-label='file system navigator'
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
			sx={{ minWidth: 220 }}
			defaultExpanded={['-1']}
		// sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
		>
			<TreeItem
				nodeId='-1'
				label={
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
						{t('pages.home')}
						<Box sx={{ display: 'flex' }}>
							<IconButton size="small" onClick={handleCreateFile}>
								<VscNewFile size={16} />
							</IconButton>
							<IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}>
								<VscNewFolder size={16} />
							</IconButton>
							<IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}>
								<VscRefresh size={16} />
							</IconButton>
						</Box>
					</Box>
				}
				color='#bdc3cf'
			>
				{pages.map(({ index, name, route, isSaved }) => (
					<TreeItem
						key={index}
						nodeId={index.toString()}
						label={
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
								{convertFileName(name)}
								{isSaved !== undefined && !isSaved && <Box sx={{ backgroundColor: '#fff', borderRadius: '100%', width: '10px', height: '10px' }}>
								</Box>}
							</Box>
						}
						sx={{
							color: renderTreeItemColor(index),
							backgroundColor: renderTreeItemBgColor(index),
							'&& .Mui-selected': {
								backgroundColor: renderTreeItemBgColor(index),
							},
						}}
						icon={<VscMarkdown color='#6997d5' />}
						onClick={() => {
							if (!visiblePageIndexes.includes(index)) {
								const newIndexes = [...visiblePageIndexes, index];
								setVisiblePageIndexes(newIndexes);
							}
							navigate(`${route}`);
							setSelectedIndex(index);
							setCurrentComponent('tree');
						}}
					/>
				))}
			</TreeItem>
		</TreeView>
	);
}
