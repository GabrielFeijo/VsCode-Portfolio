import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { VscMarkdown } from 'react-icons/vsc';
import { convertFileName } from '../utils/convertFileName';
import { useTranslation } from 'react-i18next';

interface Page {
	index: number;
	name: string;
	route: string;
}

interface Props {
	pages: {
		index: number;
		name: string;
		route: string;
	}[];
	selectedIndex: number;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	currentComponent: string;
	setCurrentComponent: React.Dispatch<React.SetStateAction<string>>;
	visiblePageIndexs: number[];
	setVisiblePageIndexs: React.Dispatch<React.SetStateAction<number[]>>;
	language: string;
}

export default function AppTree({
	pages,
	selectedIndex,
	setSelectedIndex,
	currentComponent,
	setCurrentComponent,
	visiblePageIndexs,
	setVisiblePageIndexs,
	language,
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
				label={t('pages.home')}
				color='#bdc3cf'
			>
				{pages.map(({ index, name, route }) => (
					<TreeItem
						key={index}
						nodeId={index.toString()}
						label={convertFileName(name)}
						sx={{
							color: renderTreeItemColor(index),
							backgroundColor: renderTreeItemBgColor(index),
							'&& .Mui-selected': {
								backgroundColor: renderTreeItemBgColor(index),
							},
						}}
						icon={<VscMarkdown color='#6997d5' />}
						onClick={() => {
							if (!visiblePageIndexs.includes(index)) {
								const newIndexs = [...visiblePageIndexs, index];
								setVisiblePageIndexs(newIndexs);
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
