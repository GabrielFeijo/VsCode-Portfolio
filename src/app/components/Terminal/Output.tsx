import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
	language: string;
}

const Output = ({ language }: Props) => {
	const { t } = useTranslation();
	const timeElapsed = Date.now();
	let today = new Date(timeElapsed).toLocaleString();
	const messages = t('terminal.output', { returnObjects: true }) as string[];
	return (
		<Box>
			{messages.map((message: string, index: number) => (
				<Box
					key={index}
					display='flex'
					alignItems='center'
					gap={1}
				>
					<Typography sx={{ fontSize: '.8rem', color: '#5e6c9e' }}>
						{today.replace(/,/g, ' ')}
					</Typography>
					<Typography sx={{ fontSize: '.8rem', color: '#32d97b' }}>
						[info]
					</Typography>
					<Typography sx={{ fontSize: '.8rem' }}> {message}</Typography>
				</Box>
			))}
		</Box>
	);
};

export default Output;
