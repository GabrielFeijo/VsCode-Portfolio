import {
	Box,
	Grid,
	IconButton,
	Link,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import logo from '../../static/favicon.png';
import { useLocation } from 'react-router-dom';
import Loading from '../components/Loading/Loading';
import { HomeService } from '../../services/api/home/HomeService';
import { useTranslation } from 'react-i18next';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { CacheService } from '../../services/cacheService';
import dayjs from 'dayjs';

interface Props {
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function Home({ setSelectedIndex }: Props) {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const [loading, setLoading] = useState(true);

	const contactLinks = [
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
	];

	const getConnection = async () => {
		if (!CacheService.has24HoursPassed()) {
			setLoading(false);
			return;
		}

		try {
			setTimeout(() => {
				setLoading(false);
			}, 2500);
			await HomeService.getResponse();
			CacheService.setCache({ lastFetch: dayjs().toISOString() });
		} catch (e) {
			console.error('Erro ao buscar dados do HomeService:', e);
		}
	};

	useEffect(() => {
		setSelectedIndex(-1);
	}, [setSelectedIndex]);

	useEffect(() => {
		document.title = process.env.REACT_APP_NAME!;
		getConnection();
	}, [pathname]);

	return (
		<>
			{loading && <Loading></Loading>}
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
								<Typography variant='h3'>{t('header.title')}</Typography>
							</Grid>
							<Grid
								display='flex'
								justifyContent={{ xs: 'center', sm: 'center' }}
							>
								<Typography
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
													href={link.href}
													underline='none'
													color='inherit'
												>
													<IconButton color='inherit'>{link.icon}</IconButton>
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
