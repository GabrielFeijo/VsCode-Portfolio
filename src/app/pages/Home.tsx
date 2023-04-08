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
import { contact, contato } from './links';
import Loading from '../components/Loading/Loading';
import apiFetch from '../axios/config';

interface Props {
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	language: string;
	terminal: boolean;
}

export default function Home({ setSelectedIndex, language, terminal }: Props) {
	const { pathname } = useLocation();
	const [loading, setLoading] = useState(true);
	const links = language === 'pt-BR' ? contato : contact;
	const getConnection = async () => {
		setTimeout(() => {
			setLoading(false);
		}, 4500);
		const response = await apiFetch.get('/');
		console.log(response);
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
				sx={{
					minHeight: `calc(100vh - 20px - 33px - ${
						terminal ? '300px' : '0px'
					})`,
				}}
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
								<Typography variant='h3'>
									{process.env.REACT_APP_NAME}
								</Typography>
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
									{language === 'pt-BR'
										? 'Desenvolvendo soluções tecnológicas para mudar o mundo de forma positiva.'
										: 'Developing technological solutions to change the world in a positive way.'}
									{/* Better an{' '}
<Box fontWeight="fontWeightMedium" display="inline">
oops
</Box>{' '}
than a{' '}
<Box fontWeight="fontWeightMedium" display="inline">
what if
</Box> */}
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
									{links.map((link) => (
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
									))}
								</Stack>
							</Grid>
						</Box>
					</Stack>
				</Grid>
			</Grid>
		</>
	);
}
