import { Box, Typography } from '@mui/material';
import { VscChevronRight } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { useAppPalette } from '../../theme/useAppPalette';
import { fonts } from '../../theme/typography';

interface Props {
	language?: string;
}

const Debug = (_props: Props = {}) => {
	const { t } = useTranslation();
	const colors = useAppPalette();

	return (
		<Box
			position={'absolute'}
			left={0}
			bottom={0}
			width={'100%'}
			display='flex'
			alignItems='center'
			borderTop={`1px solid ${colors.border}`}
		>
			<VscChevronRight color={colors.textMuted} />
			<Typography
				sx={{
					fontFamily: fonts.mono,
					fontSize: '.9rem',
					fontWeight: 'bold',
					color: colors.textMuted,
				}}
			>
				{t('terminal.debug')}
			</Typography>
		</Box>
	);
};

export default Debug;
