import { Box } from '@mui/material';

import Logo from '../../../vscode.svg';
import './Loading.css';

const Loading = () => {
	return (
		<Box
			zIndex={99}
			width={'100vw'}
			height={'100vh'}
			position={'absolute'}
			top={0}
			left={0}
			display={'flex'}
			justifyContent={'center'}
			alignItems={'center'}
			flexDirection={'column'}
			sx={{ backgroundColor: '#282a36' }}
		>
			<img
				src={Logo}
				alt='Logo vscode'
				style={{ height: '20%' }}
				className='logo'
			/>
		</Box>
	);
};

export default Loading;
