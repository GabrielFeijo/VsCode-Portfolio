import { getReviewSchema } from '../../../src/app/components/Rating/schemas/BoxRatingSchema';

describe('BoxRatingSchema', () => {
    const t = (key: string) => key;

    const schema = getReviewSchema(t);

    it('validates correct data', () => {
        const validData = {
            username: 'John Doe',
            comment: 'This is a great comment that meets the minimum length requirement!',
            stars: 5,
        };

        const result = schema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it('fails validation for short username', () => {
        const invalidData = {
            username: 'J',
            comment: 'This is a great comment that meets the minimum length requirement!',
            stars: 5,
        };

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['username'],
                        message: 'rating.errors.usernameMin',
                    }),
                ])
            );
        }
    });

    it('fails validation for short comment', () => {
        const invalidData = {
            username: 'John Doe',
            comment: 'Short',
            stars: 5,
        };

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['comment'],
                        message: 'rating.errors.commentMin',
                    }),
                ])
            );
        }
    });

    it('fails validation for low stars', () => {
        const invalidData = {
            username: 'John Doe',
            comment: 'This is a great comment that meets the minimum length requirement!',
            stars: 0,
        };

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['stars'],
                        message: 'rating.error',
                    }),
                ])
            );
        }
    });

    it('fails validation for high stars', () => {
        const invalidData = {
            username: 'John Doe',
            comment: 'This is a great comment that meets the minimum length requirement!',
            stars: 6,
        };

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['stars'],
                        message: 'rating.errors.starsMax',
                    }),
                ])
            );
        }
    });

    it('fails validation for multiple errors', () => {
        const invalidData = {
            username: 'J',
            comment: 'Short',
            stars: 0,
        };

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const issues = result.error.issues;
            expect(issues).toHaveLength(3);
            expect(issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['username'],
                        message: 'rating.errors.usernameMin',
                    }),
                    expect.objectContaining({
                        path: ['comment'],
                        message: 'rating.errors.commentMin',
                    }),
                    expect.objectContaining({
                        path: ['stars'],
                        message: 'rating.error',
                    }),
                ])
            );
        }
    });
});