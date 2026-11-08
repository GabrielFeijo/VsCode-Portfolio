import { Box, Grid, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import type React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../config/site';
import logo from '../../static/favicon.webp';
import { useContactLinks } from '../hooks/useContactLinks';

interface Props {
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function Home({ setSelectedIndex }: Props) {
	const { t } = useTranslation();
	const contactLinks = useContactLinks();

	useEffect(() => {
		setSelectedIndex(-1);
		document.title = siteConfig.name;
	}, [setSelectedIndex]);

	return (
		<Grid
			container
			spacing={0}
			direction='column'
			alignItems='center'
			justifyContent='center'
			sx={{ minHeight: '100%', px: 2, py: 3 }}
		>
			<Grid item xs={12} sx={{ maxWidth: '100%' }}>
				<Stack
					direction={{ xs: 'column', sm: 'row-reverse' }}
					spacing={{ xs: 2, sm: 3 }}
					alignItems='center'
					justifyContent='center'
				>
					<Box display='flex' sx={{ justifyContent: 'center' }}>
						<img
							src={logo}
							width={150}
							height={150}
							decoding='async'
							style={{ maxWidth: '100%', height: 'auto', width: 150 }}
							alt='logo'
						/>
					</Box>
					<Box sx={{ maxWidth: '100%' }}>
						<Grid display='flex' justifyContent='center'>
							<Typography
								component='h1'
								variant='h3'
								sx={{
									fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
									textAlign: 'center',
									wordBreak: 'break-word',
								}}
							>
								{t('header.title')}
							</Typography>
						</Grid>
						<Grid display='flex' justifyContent='center'>
							<Typography
								component='p'
								variant='subtitle1'
								gutterBottom
								sx={{
									maxWidth: 340,
									width: '100%',
									px: 1,
									textAlign: 'center',
								}}
							>
								{t('header.subtitle')}
							</Typography>
						</Grid>
						<Grid display='flex' justifyContent='center'>
							<Stack direction='row' spacing={0.4}>
								{contactLinks.map((link) => (
									<Tooltip key={link.index} title={link.title} arrow>
										<Link
											target='_blank'
											rel='noopener noreferrer'
											href={link.href}
											underline='none'
											color='inherit'
										>
											<IconButton color='inherit' aria-label={link.title}>
												{link.icon}
											</IconButton>
										</Link>
									</Tooltip>
								))}
							</Stack>
						</Grid>
					</Box>
				</Stack>
			</Grid>
		</Grid>
	);
}
