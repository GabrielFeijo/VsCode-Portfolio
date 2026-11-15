import { Box, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IoIosGitBranch } from 'react-icons/io';
import { VscBell, VscCheck, VscError, VscFeedback, VscRemote, VscWarning } from 'react-icons/vsc';
import { siteConfig } from '../../config/site';
import { LAYOUT } from '../../constants/layout';
import { useAppPalette } from '../theme/useAppPalette';

export default function Footer() {
	const colors = useAppPalette();
	const { t } = useTranslation();

	return (
		<Box
			component={Paper}
			square
			elevation={0}
			sx={{
				height: `${LAYOUT.FOOTER_HEIGHT}px`,
				color: colors.textPrimary,
				bgcolor: colors.bgFooter,
				overflow: 'hidden',
			}}
			display='flex'
		>
			<Grid
				container
				wrap='nowrap'
				alignItems='stretch'
				justifyContent='space-between'
				sx={{ height: '100%' }}
			>
				<Grid item display='flex' alignItems='stretch' sx={{ height: '100%', minWidth: 0 }}>
					<Box
						component='button'
						type='button'
						aria-label={t('footer.remote')}
						tabIndex={0}
						sx={{
							width: `${LAYOUT.REMOTE_BUTTON_WIDTH}px`,
							height: '100%',
							flexShrink: 0,
							backgroundColor: colors.footerAccent,
							justifyContent: 'center',
							alignItems: 'center',
							padding: 0,
							border: 'none',
							cursor: 'pointer',
							'&:hover': { opacity: 0.85 },
						}}
						display='flex'
					>
						<VscRemote fontSize='0.9rem' style={{ color: colors.textInverse }} />
					</Box>
					<Stack
						direction='row'
						spacing={0}
						sx={{ height: '100%', minWidth: 0 }}
						alignItems='stretch'
					>
						<Box
							component={Link}
							href={siteConfig.repoUrl}
							underline='none'
							color='inherit'
							target='_blank'
							rel='noopener noreferrer'
							aria-label={t('footer.viewSource')}
							display='flex'
							sx={{
								height: '100%',
								px: 1.25,
								justifyContent: 'center',
								alignItems: 'center',
								color: colors.textPrimary,
								transition: 'background-color 0.15s ease',
								'&:hover': {
									backgroundColor: colors.footerHover,
									color: colors.textPrimary,
								},
							}}
						>
							<IoIosGitBranch fontSize='0.9rem' />
							<Typography sx={{ ml: 0.5, fontSize: '0.6rem', lineHeight: 1 }}>main</Typography>
						</Box>

						<Stack
							direction='row'
							spacing={0.5}
							role='status'
							aria-label={t('footer.problems')}
							alignItems='center'
							sx={{
								height: '100%',
								px: 1,
							}}
						>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center' }}>
								<VscError fontSize='0.9rem' aria-hidden='true' />
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center' }}>
								<Typography
									sx={{ fontSize: '0.6rem', lineHeight: 1 }}
									aria-label={t('footer.errors')}
								>
									0
								</Typography>
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center' }}>
								<VscWarning fontSize='0.9rem' aria-hidden='true' />
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center' }}>
								<Typography
									sx={{ fontSize: '0.6rem', lineHeight: 1 }}
									aria-label={t('footer.warnings')}
								>
									0
								</Typography>
							</Box>
						</Stack>
					</Stack>
				</Grid>
				<Grid
					item
					sx={{
						height: '100%',
						backgroundColor: colors.bgFooter,
						flexShrink: 0,
					}}
					display='flex'
					alignItems='stretch'
					justifyContent='flex-end'
				>
					<Stack
						justifyContent='end'
						alignItems='center'
						direction='row'
						spacing={0.8}
						sx={{ height: '100%', pr: 1 }}
					>
						<Box
							display='flex'
							sx={{
								px: 0.5,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<VscCheck fontSize='0.9rem' />
							<Typography sx={{ ml: 0.5, mt: 0.1, fontSize: '0.6rem' }}>Biome</Typography>
						</Box>
						<Box
							display='flex'
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								py: 0.3,
								px: 0.5,
							}}
						>
							<VscFeedback fontSize='0.9rem' />
						</Box>
						<Box
							display='flex'
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								py: 0.3,
								px: 0.5,
							}}
						>
							<VscBell fontSize='0.9rem' />
						</Box>
					</Stack>
				</Grid>
			</Grid>
		</Box>
	);
}
