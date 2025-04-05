import { Box, Typography } from '@mui/material';
import { VscChevronRight } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';

interface Props {
	language: string;
}

const Debug = ({ language }: Props) => {
	const { t } = useTranslation();
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
				{t('terminal.debug')}
			</Typography>
		</Box>
	);
};

export default Debug;
