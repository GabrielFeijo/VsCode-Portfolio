import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fonts } from '../../theme/typography';
import { useAppPalette } from '../../theme/use-app-palette';

interface ProblemsProps {
	language?: string;
}

const Problems = (_props?: ProblemsProps) => {
	const { t } = useTranslation();
	const colors = useAppPalette();
	return (
		<Box>
			<Typography sx={{ fontSize: '.8rem', color: colors.textSecondary, fontFamily: fonts.mono }}>
				{t('terminal.problems')}
			</Typography>
		</Box>
	);
};

export default Problems;
