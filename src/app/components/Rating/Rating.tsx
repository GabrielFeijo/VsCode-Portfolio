import React, { useState } from 'react';
import {
	Box,
	TextField,
	Typography,
	useTheme,
	Rating,
	Button,
} from '@mui/material';
import { VscClose } from 'react-icons/vsc';
import './Rating.css';
import apiFetch from '../../axios/config';

const info = {
	'pt-BR': {
		evaluate: 'Avalie este portfólio',
		name: 'Seu nome',
		comment: 'Seu comentário',
		submit: 'Enviar avaliação',
		error: 'Preencha todas as informações',
	},
	en: {
		evaluate: 'Evaluate this portfolio.',
		name: 'Your name',
		comment: 'Your comment',
		submit: 'Send review',
		error: 'Please fill in all the information',
	},
};

interface Props {
	language: string;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
}

const labelsPT: { [index: string]: string } = {
	0.5: 'Inútil',
	1: 'Inútil+',
	1.5: 'Ruim',
	2: 'Ruim+',
	2.5: 'Ok',
	3: 'Ok+',
	3.5: 'Bom',
	4: 'Bom+',
	4.5: 'Excelente',
	5: 'Excelente+',
};
const labelsEN: { [index: string]: string } = {
	0.5: 'Useless',
	1: 'Useless+',
	1.5: 'Poor',
	2: 'Poor+',
	2.5: 'Ok',
	3: 'Ok+',
	3.5: 'Good',
	4: 'Good+',
	4.5: 'Excellent',
	5: 'Excellent+',
};

const BoxRating = ({ language, setRanking }: Props) => {
	const theme = useTheme();
	const [error, setError] = useState('');
	const [star, setStar] = useState<number | null>(0);
	const [review, setReview] = useState({ username: '', comment: '' });

	function handleChange(e: {
		target: { name: string; value: string | number };
	}) {
		setReview({ ...review, [e.target.name]: e.target.value });
	}

	const sendReview = async () => {
		if (review.username !== '' && review.comment !== '' && star !== 0) {
			setRanking(false);
			try {
				await apiFetch.post('/api/createReview', {
					username: review.username,
					comment: review.comment,
					stars: star,
				});
			} catch (error) {
				console.log(error);
			}
		} else {
			setError(info[language as keyof typeof info].error);
			setTimeout(() => {
				setError('');
			}, 1500);
		}
	};

	return (
		<>
			<Box className='wrap'></Box>

			<Box
				className='box-rating'
				sx={{
					backgroundColor:
						theme.palette.mode === 'dark' ? '#21222c' : '#f3f3f3',
				}}
			>
				<Box
					display='flex'
					alignItems='center'
					justifyContent='space-between'
					width={300}
					sx={{ mb: 1.5 }}
				>
					<Box></Box>
					<Typography sx={{ fontWeight: 'bold' }}>
						{info[language as keyof typeof info].evaluate}
					</Typography>
					<VscClose
						style={{
							fontSize: '1.3em',
						}}
						cursor={'pointer'}
						className='btn_hover'
						onClick={() => setRanking(false)}
					/>
				</Box>
				<TextField
					label={info[language as keyof typeof info].name}
					error={review.username ? false : true}
					type='text'
					name='username'
					sx={{ m: 1.5 }}
					fullWidth
					onChange={handleChange}
					value={review.username ? review.username : ''}
					autoComplete='off'
				/>
				<TextField
					label={info[language as keyof typeof info].comment}
					error={review.comment ? false : true}
					name='comment'
					type='text'
					fullWidth
					onChange={handleChange}
					value={review.comment ? review.comment : ''}
				/>
				<Box
					display={'flex'}
					flexDirection={'column'}
					alignItems={'center'}
					sx={{
						m: 2,
						p: 1,
						width: '100%',
						borderRadius: 1,
						border: '1px solid #54555d',
					}}
				>
					<Rating
						name='star'
						value={star}
						precision={0.5}
						onChange={(event, newValue) => {
							setStar(newValue);
						}}
					/>
					<Box>
						{language === 'pt-BR'
							? labelsPT[star !== null ? star : 0]
							: labelsEN[star !== null ? star : 0]}
					</Box>
				</Box>
				<Button
					variant='outlined'
					fullWidth
					onClick={sendReview}
				>
					{info[language as keyof typeof info].submit}
				</Button>
				{error.length > 0 ? (
					<Typography sx={{ m: 1, color: '#ed4337' }}>{error}</Typography>
				) : (
					<></>
				)}
			</Box>
		</>
	);
};

export default BoxRating;
