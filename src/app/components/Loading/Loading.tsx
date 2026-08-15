import { Box } from '@mui/material';
import Logo from '../../../vscode.svg';
import './Loading.css';

const Loading = () => {
	return (
		<Box
			zIndex={99}
			width={'100%'}
			height={'var(--app-viewport-height)'}
			position={'absolute'}
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
