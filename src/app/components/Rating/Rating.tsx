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
import { ReviewService } from '../../../services/api/review/ReviewService';
import { useTranslation } from 'react-i18next';

interface Props {
	language: string;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoxRating = ({ language, setRanking }: Props) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const [error, setError] = useState('');
	const [star, setStar] = useState<number>(0);
	const [review, setReview] = useState({ username: '', comment: '' });

	function handleChange(e: {
		target: { name: string; value: string | number };
	}) {
		setReview({ ...review, [e.target.name]: e.target.value });
	}

	const sendReview = async () => {
		if (review.username !== '' && review.comment !== '' && star !== 0) {
			setRanking(false);

			const response = await ReviewService.create({
				username: review.username,
				comment: review.comment,
				stars: star,
			});

			if (response instanceof Error) {
				console.log(response.message);
			}
		} else {
			setError(t('rating.error'));
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
						{t('rating.evaluate')}
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
					label={t('rating.name')}
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
					label={t('rating.comment')}
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
							if (newValue) {
								setStar(newValue);
							}
						}}
					/>
					<Box>{t(`terminal.rating.${star !== null ? star : 0}`)}</Box>
				</Box>
				<Button
					variant='outlined'
					fullWidth
					onClick={sendReview}
				>
					{t('rating.submit')}
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
