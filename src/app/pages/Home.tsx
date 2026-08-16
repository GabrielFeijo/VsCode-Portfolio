import {
	Box,
	Grid,
	IconButton,
	Link,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import logo from '../../static/favicon.png';
import { useLocation } from 'react-router-dom';
import Loading from '../components/Loading/Loading';
import { useHomeQuery } from '@/hooks/queries/useHomeQuery';
import { useTranslation } from 'react-i18next';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { siteConfig } from '../../config/site';

interface Props {
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function Home({ setSelectedIndex }: Props) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const { isLoading } = useHomeQuery();

	const contactLinks = useMemo(() => [
		{
			index: 0,
			icon: <FaGithub />,
			title: t('contact.github.title'),
			href: t('contact.github.href'),
		},
		{
			index: 1,
			icon: <FaLinkedin />,
			title: t('contact.linkedin.title'),
			href: t('contact.linkedin.href'),
		},
		{
			index: 2,
			icon: <FaEnvelope />,
			title: t('contact.email.title'),
			href: t('contact.email.href'),
		},
	], [t]);

	useEffect(() => {
		setSelectedIndex(-1);
	}, [setSelectedIndex]);

	useEffect(() => {
		document.title = siteConfig.name;
	}, [pathname]);

	return (
		<>
			{isLoading && <Loading />}
			<Grid
				container
				spacing={0}
				direction='column'
				alignItems='center'
				justifyContent='center'
				style={{ minHeight: '100%' }}
			>
				<Grid
					item
					xs={3}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row-reverse' }}
						spacing={2}
					>
						<Box
							display='flex'
							sx={{ justifyContent: 'center' }}
						>
							<img
								src={logo}
								height='150px'
								alt='logo'
							/>
						</Box>
						<Box>
							<Grid
								display='flex'
								justifyContent={{ xs: 'center', sm: 'center' }}
							>
								<Typography component='h1' variant='h3'>{t('header.title')}</Typography>
							</Grid>
							<Grid
								display='flex'
								justifyContent={{ xs: 'center', sm: 'center' }}
							>
								<Typography
									component='p'
									variant='subtitle1'
									gutterBottom
									style={{ width: 300, textAlign: 'center' }}
								>
									{t('header.subtitle')}
								</Typography>
							</Grid>
							<Grid
								display='flex'
								justifyContent={{ xs: 'center', sm: 'center' }}
							>
								<Stack
									direction='row'
									spacing={0.4}
								>
									{contactLinks.map((link) => {
										return (
											<Tooltip
												key={link.index}
												title={link.title}
												arrow
											>
											<Link
												target='_blank'
												rel='noopener noreferrer'
												href={link.href}
													underline='none'
													color='inherit'
												>
												<IconButton
													color='inherit'
													aria-label={link.title}
												>
													{link.icon}
												</IconButton>
												</Link>
											</Tooltip>
										);
									})}
								</Stack>
							</Grid>
						</Box>
					</Stack>
				</Grid>
			</Grid>
		</>
	);
}
