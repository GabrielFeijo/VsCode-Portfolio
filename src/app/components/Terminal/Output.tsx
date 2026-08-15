import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppPalette } from '../../theme/useAppPalette';
import { fonts } from '../../theme/typography';

interface Props {
	language: string;
}

const Output = ({ language }: Props) => {
	const { t } = useTranslation();
	const colors = useAppPalette();
	const today = new Date().toLocaleString();
	const messages = t('terminal.output', { returnObjects: true }) as string[];

	return (
		<Box>
			{messages.map((message: string, index: number) => (
				<Box key={index} display='flex' alignItems='center' gap={1}>
					<Typography sx={{ fontSize: '.8rem', color: colors.textMuted, fontFamily: fonts.mono }}>
						{today.replace(/,/g, ' ')}
					</Typography>
					<Typography sx={{ fontSize: '.8rem', color: colors.success, fontFamily: fonts.mono }}>
						[info]
					</Typography>
					<Typography sx={{ fontSize: '.8rem', color: colors.textPrimary }}>{message}</Typography>
				</Box>
			))}
		</Box>
	);
};

export default Output;
