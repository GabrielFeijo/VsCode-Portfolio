'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscChromeClose } from 'react-icons/vsc';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BoxRating.module.css';
import { ReviewService } from '../../../services/api/review/ReviewService';
import { useTheme } from '../../../contexts/ThemeContext';
import { fadeInOut } from '../../../utils/motionVariants';
import { Rating } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

interface Props {
	ranking: boolean;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BoxRating({ ranking, setRanking }: Props) {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const isDarkMode = theme === 'dark';
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
				console.error(response.message);
			}
		} else {
			setError(t('rating.error'));
			setTimeout(() => {
				setError('');
			}, 1500);
		}
	};

	return (
		<AnimatePresence>
			{ranking && (
				<motion.div
					className={styles.modalContainer}
					variants={fadeInOut}
					initial='initial'
					animate='animate'
					exit='exit'
				>
					<motion.div
						className={`${styles.modal} ${isDarkMode ? styles.dark : ''}`}
						variants={{
							initial: { scale: 0.95, opacity: 0 },
							animate: { scale: 1, opacity: 1 },
							exit: { scale: 0.95, opacity: 0 },
						}}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<div className={styles.modalHeader}>
							<div></div>
							<h3 className={styles.title}>{t('rating.evaluate')}</h3>
							<button
								className={styles.closeButton}
								onClick={() => setRanking(false)}
								aria-label='Close'
							>
								<VscChromeClose />
							</button>
						</div>

						<div className={styles.modalContent}>
							<div className={styles.formField}>
								<label
									htmlFor='username'
									className={styles.label}
								>
									{t('rating.name')}
								</label>
								<input
									id='username'
									type='text'
									name='username'
									className={`${styles.input} ${review.username ? '' : styles.error
										}`}
									onChange={handleChange}
									value={review.username}
									autoComplete='off'
								/>
							</div>

							<div className={styles.formField}>
								<label
									htmlFor='comment'
									className={styles.label}
								>
									{t('rating.comment')}
								</label>
								<textarea
									id='comment'
									name='comment'
									className={`${styles.textarea} ${review.comment ? '' : styles.error
										}`}
									onChange={handleChange}
									value={review.comment}
									rows={3}
								/>
							</div>

							<div className={styles.ratingContainer}>
								<Rating
									name='star'
									value={star}
									precision={0.5}
									onChange={(event, newValue) => {
										if (newValue) {
											setStar(newValue);
										}
									}}
									icon={
										<Star
											fontSize='inherit'
											sx={{
												transition: 'transform 0.2s, filter 0.2s',
											}}
										/>
									}
									emptyIcon={
										<StarBorder
											fontSize='inherit'
											sx={{
												color: '#ccc',
												transition: 'color 0.2s',
											}}
										/>
									}
								/>
								<div className={styles.ratingText}>
									{star > 0 &&
										t(`terminal.rating.${String(star).replace('.', '_')}`)}
								</div>
							</div>

							<button
								className={styles.submitButton}
								onClick={sendReview}
								aria-label={t('rating.submit') || 'Submit rating'}
							>
								{t('rating.submit')}
							</button>

							{error.length > 0 && (
								<motion.div
									className={styles.errorMessage}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
								>
									{error}
								</motion.div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
