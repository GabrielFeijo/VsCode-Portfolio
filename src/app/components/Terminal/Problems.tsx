import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
	language: string;
}

const Problems = ({ language }: Props) => {
	const { t } = useTranslation();
	return (
		<Box>
			<Typography sx={{ fontSize: '.8rem' }}>
				{t('terminal.problems')}
			</Typography>
		</Box>
	);
};

export default Problems;
