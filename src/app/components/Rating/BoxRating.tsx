import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VscChromeClose } from 'react-icons/vsc';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getReviewSchema } from './schemas/BoxRatingSchema';
import styles from './BoxRating.module.css';
import { ApiError, ReviewService } from '../../../services/api/review/ReviewService';
import { fadeInOut } from '../../../utils/motionVariants';
import { Rating } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

interface Props {
	ranking: boolean;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ReviewFormData {
	username: string;
	comment: string;
	stars: number;
}

export default function BoxRating({ ranking, setRanking }: Props) {
	const { t } = useTranslation();

	const reviewSchema = getReviewSchema(t);

	const [error, setError] = useState('');
	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		formState: { errors },
	} = useForm<ReviewFormData>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			username: '',
			comment: '',
			stars: 0,
		},
		mode: 'onBlur',
	});

	const stars = watch('stars');

	const showError = (message: string) => {
		setError(message);
		setTimeout(() => setError(''), 1500);
	};

	const getErrorMessage = (error: ApiError): string => {
		const statusCode = error.statusCode;

		if (statusCode === 400 && error.validationErrors) {
			const validationError = error.validationErrors[0];

			if (validationError.includes('Username must be at least')) {
				return t('rating.errors.usernameMin');
			}
			if (validationError.includes('Comment must be at least')) {
				return t('rating.errors.commentMin');
			}
			if (validationError.includes('Stars must not exceed')) {
				return t('rating.errors.starsMax');
			}

			return validationError;
		}

		if (statusCode === 429) {
			return t('rating.errors.tooManyRequests');
		}

		if (statusCode && statusCode >= 500) {
			return t('rating.errors.serverError');
		}

		if (error.message.toLowerCase().includes('network')) {
			return t('rating.errors.networkError');
		}

		return t('rating.errors.unknownError');
	};

	const onSubmit = async (data: ReviewFormData) => {
		const response = await ReviewService.create({
			username: data.username.trim(),
			comment: data.comment.trim(),
			stars: data.stars,
		});

		if (response instanceof Error) {
			const errorMessage = getErrorMessage(response);
			showError(errorMessage);
			return;
		}

		reset();
		setRanking(false);
	};

	useEffect(() => {
		if (!ranking) {
			reset();
			setError('');
		}
	}, [ranking, reset]);

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
						className={styles.modal}
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
								aria-label={t('rating.close') || 'Close rating modal'}
							>
								<VscChromeClose />
							</button>
						</div>

						<div className={styles.modalContent}>
							<form onSubmit={handleSubmit(onSubmit)}>
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
										{...register('username')}
										className={`${styles.input} ${errors.username ? styles.error : ''}`}
										autoComplete='off'
										placeholder={t('rating.namePlaceholder')}
									/>
									{errors.username && <span className={styles.errorSpan}>{errors.username.message}</span>}
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
										{...register('comment')}
										className={`${styles.textarea} ${errors.comment ? styles.error : ''}`}
										rows={3}
										autoComplete='off'
										placeholder={t('rating.commentPlaceholder')}
									/>
									{errors.comment && <span className={styles.errorSpan}>{errors.comment.message}</span>}
								</div>

								<div className={styles.ratingContainer}>
									<Controller
										name='stars'
										control={control}
										render={({ field }) => (
											<Rating
												{...field}
												value={field.value}
												precision={0.5}
												onChange={(_, newValue) => {
													field.onChange(newValue || 0);
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
										)}
									/>
									<div className={styles.ratingText}>
										{stars > 0 &&
											t(`terminal.rating.${String(stars).replace('.', '_')}`)}
									</div>
									{errors.stars && <span className={styles.errorSpan}>{errors.stars.message}</span>}
								</div>

								<button
									type='submit'
									className={styles.submitButton}
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
							</form>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
