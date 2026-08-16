import { Box, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import {
	VscRemote,
	VscError,
	VscWarning,
	VscBell,
	VscFeedback,
	VscCheck,
} from 'react-icons/vsc';
import { IoIosGitBranch } from 'react-icons/io';
import { useAppPalette } from '../theme/useAppPalette';
import { siteConfig } from '../../config/site';
import { LAYOUT } from '../../constants/layout';

export default function Footer() {
	const colors = useAppPalette();

	return (
		<Box
			component={Paper}
			square
			elevation={0}
			sx={{ height: `${LAYOUT.FOOTER_HEIGHT}px`, color: colors.textPrimary, bgcolor: colors.bgFooter }}
			display='flex'
		>
			<Grid container>
				<Grid
					item
					component="button"
					role="button"
					aria-label="Remote connection status"
					tabIndex={0}
					sx={{
						width: `${LAYOUT.REMOTE_BUTTON_WIDTH}px`,
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
					<VscRemote
						fontSize='0.9rem'
						style={{ color: colors.textInverse }}
					/>
				</Grid>
				<Grid
					item
					sx={{ backgroundColor: colors.bgFooter, width: `${LAYOUT.GIT_INFO_WIDTH}px` }}
					display='flex'
				>
					<Stack direction='row' spacing={0.5} sx={{ pl: 1 }}>
						<Box
							component={Link}
							href={siteConfig.githubUrl}
							underline='none'
							color='inherit'
							target='_blank'
							rel="noopener noreferrer"
							aria-label="View source code on GitHub - main branch"
							display='flex'
							sx={{
								px: 0.5,
								justifyContent: 'center',
								alignItems: 'center',
								'&:hover': { background: colors.footerHover },
							}}
						>
							<IoIosGitBranch fontSize='0.9rem' />
							<Typography sx={{ ml: 0.5, mt: 0.1, fontSize: '0.6rem' }}>
								main
							</Typography>
						</Box>

						<Stack
							direction='row'
							spacing={0.5}
							role="status"
							aria-label="Errors and warnings count"
							sx={{
								px: 0.5,
							}}
						>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center', py: 0.3 }}>
								<VscError fontSize='0.9rem' aria-hidden="true" />
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center', pt: 0.3 }}>
								<Typography sx={{ fontSize: '0.6rem' }} aria-label="Errors count">0</Typography>
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center', py: 0.3 }}>
								<VscWarning fontSize='0.9rem' aria-hidden="true" />
							</Box>
							<Box display='flex' sx={{ justifyContent: 'center', alignItems: 'center', pt: 0.3 }}>
								<Typography sx={{ fontSize: '0.6rem' }} aria-label="Warnings count">0</Typography>
							</Box>
						</Stack>
					</Stack>
				</Grid>
				<Grid
					item
					sx={{ backgroundColor: colors.bgFooter, minWidth: `calc(100% - ${LAYOUT.REMOTE_BUTTON_WIDTH + LAYOUT.GIT_INFO_WIDTH}px)` }}
					display='flex'
					justifyContent='flex-end'
				>
					<Stack justifyContent='end' direction='row' spacing={0.8} sx={{ pr: 1.5 }}>
						<Box
							display='flex'
							sx={{
								px: 0.5,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<VscCheck fontSize='0.9rem' />
							<Typography sx={{ ml: 0.5, mt: 0.1, fontSize: '0.6rem' }}>
								Prettier
							</Typography>
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
								width: '50%',
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
