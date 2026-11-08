import { Box } from '@mui/material';
import Logo from '../../../vscode.svg';
import './Loading.css';

export const LOADING_Z_INDEX = 9999;

const Loading = () => {
	return (
		<Box
			zIndex={LOADING_Z_INDEX}
			width={'100%'}
			height={'var(--app-viewport-height)'}
			position={'fixed'}
			top={0}
			left={0}
			display={'flex'}
			justifyContent={'center'}
			alignItems={'center'}
			flexDirection={'column'}
			sx={{ backgroundColor: 'var(--bg-primary)' }}
		>
			<img src={Logo} alt='Logo vscode' style={{ height: '20%' }} className='logo' />
		</Box>
	);
};

export default Loading;
