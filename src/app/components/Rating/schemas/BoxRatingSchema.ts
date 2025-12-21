import { z } from 'zod';

export const getReviewSchema = (t: (key: string) => string) =>
    z.object({
        username: z.string().min(2, t('rating.errors.usernameMin')),
        comment: z.string().min(10, t('rating.errors.commentMin')),
        stars: z.number().min(0.5, t('rating.error')).max(5, t('rating.errors.starsMax')),
    });