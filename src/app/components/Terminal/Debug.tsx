import { Box, Typography } from '@mui/material';
import { VscChevronRight } from 'react-icons/vsc';

interface Props {
	language: string;
}

const info = {
	'pt-BR': 'Inicie uma sessão de depuração para avaliar as expressões',
	en: 'No problems were detected in the workspace.',
};

const Debug = ({ language }: Props) => {
	return (
		<Box
			position={'absolute'}
			left={0}
			bottom={0}
			width={'100%'}
			display='flex'
			alignItems='center'
			borderTop={`1px solid black`}
		>
			<VscChevronRight />
			<Typography
				sx={{ fontFamily: 'Monospace', fontSize: '.9rem', fontWeight: 'bold' }}
				color={'#7b7c81'}
			>
				{info[language as keyof typeof info]}
			</Typography>
		</Box>
	);
};

export default Debug;
