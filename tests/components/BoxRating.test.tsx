import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.useFakeTimers();

const mockCreate = jest.fn();
jest.mock('../../src/services/api/review/ReviewService', () => ({
    __esModule: true,
    ReviewService: {
        create: mockCreate,
    },
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
    __esModule: true,
    useTheme: jest.fn(),
}));

const mockT = jest.fn((key: string) => key);
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

const { useTheme } = require('../../src/contexts/ThemeContext');
import BoxRating from '../../src/app/components/Rating/BoxRating';

describe('BoxRating component', () => {
    beforeEach(() => {
        mockCreate.mockClear();
        useTheme.mockReturnValue({ theme: 'light' });
        mockT.mockImplementation((key: string) => key);
    });

    it('renders the modal when ranking is true', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        expect(screen.getByText('rating.evaluate')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.name')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.comment')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rating.submit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rating.close/i })).toBeInTheDocument();
    });

    it('does not render the modal when ranking is false', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={false} setRanking={setRanking} />);

        expect(screen.queryByText('rating.evaluate')).not.toBeInTheDocument();
    });

    it('updates username input', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        await userEvent.type(usernameInput, 'Test User');

        expect(usernameInput).toHaveValue('Test User');
    });

    it('updates comment textarea', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const commentTextarea = screen.getByLabelText('rating.comment');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        expect(commentTextarea).toHaveValue('Great portfolio!');
    });

    it('updates star rating', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        expect(screen.queryByText(/terminal.rating/)).not.toBeInTheDocument();

        const threeStars = screen.getByRole('radio', { name: '3 Stars' });
        fireEvent.click(threeStars);

        expect(screen.getByText('terminal.rating.3')).toBeInTheDocument();
    });

    it('shows error when submit without required fields and clears after timeout', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const submit = screen.getByRole('button', { name: /rating.submit/i });
        fireEvent.click(submit);

        expect(screen.queryByText(/rating.error/i)).not.toBeInTheDocument();
    });

    it('closes the modal when close button is clicked', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const closeButton = screen.getByRole('button', { name: /rating.close/i });
        fireEvent.click(closeButton);

        expect(setRanking).toHaveBeenCalledWith(false);
    });

    it('applies error class to inputs when empty on submit', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const submit = screen.getByRole('button', { name: /rating.submit/i });
        fireEvent.click(submit);

        await waitFor(() => {
            const usernameInput = screen.getByLabelText('rating.name');
            const commentTextarea = screen.getByLabelText('rating.comment');

            expect(usernameInput).toHaveClass('error');
            expect(commentTextarea).toHaveClass('error');
        });
    });

    it('removes error class when inputs are filled', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        fireEvent.click(submit);

        await userEvent.type(usernameInput, 'Test');
        await userEvent.type(commentTextarea, 'Comment here long enough');

        await waitFor(() => {
            expect(usernameInput).not.toHaveClass('error');
            expect(commentTextarea).not.toHaveClass('error');
        });
    });

    it('removes error class when inputs are filled', async () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');

        await userEvent.type(usernameInput, 'Test');
        await userEvent.type(commentTextarea, 'Comment here long enough');

        await userEvent.type(usernameInput, 'Test');
        await userEvent.type(commentTextarea, 'Comment here long enough');

        expect(usernameInput).not.toHaveClass('error');
        expect(commentTextarea).not.toHaveClass('error');
    });

    it('calls ReviewService.create when all fields are filled and star > 0', async () => {
        const setRanking = jest.fn();
        mockCreate.mockResolvedValue({});

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio comment!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 1) {
            fireEvent.click(stars[1]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith({
                username: 'Test User',
                comment: 'Great portfolio comment!',
                stars: 1,
            });
        });

        expect(setRanking).toHaveBeenCalledWith(false);
    });

    it('shows error message when ReviewService.create fails', async () => {
        const setRanking = jest.fn();
        const error = new Error('API Error') as any;
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            await act(async () => {
                fireEvent.click(stars[0]);
            });
        }

        await act(async () => {
            fireEvent.click(submit);
        });

        await waitFor(() => {
            expect(screen.getByText('rating.errors.unknownError')).toBeInTheDocument();
        });

        expect(setRanking).not.toHaveBeenCalledWith(false);
    });

    it('shows validation error for username too short (400)', async () => {
        const setRanking = jest.fn();
        const error = new Error('Bad Request') as any;
        error.statusCode = 400;
        error.validationErrors = ['Username must be at least 2 characters'];
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.usernameMin')).toBeInTheDocument();
        });
    });

    it('shows too many requests error (429)', async () => {
        const setRanking = jest.fn();
        const error = new Error('Too Many Requests') as any;
        error.statusCode = 429;
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.tooManyRequests')).toBeInTheDocument();
        });
    });

    it('shows server error for 500+ status codes', async () => {
        const setRanking = jest.fn();
        const error = new Error('Internal Server Error') as any;
        error.statusCode = 500;
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.serverError')).toBeInTheDocument();
        });
    });

    it('shows network error message', async () => {
        const setRanking = jest.fn();
        const error = new Error('Network Error') as any;
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.networkError')).toBeInTheDocument();
        });
    });

    it('shows validation error for comment too short (400)', async () => {
        const setRanking = jest.fn();
        const error = new Error('Bad Request') as any;
        error.statusCode = 400;
        error.validationErrors = ['Comment must be at least 10 characters'];
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.commentMin')).toBeInTheDocument();
        });
    });

    it('shows validation error for stars exceeding limit (400)', async () => {
        const setRanking = jest.fn();
        const error = new Error('Bad Request') as any;
        error.statusCode = 400;
        error.validationErrors = ['Stars must not exceed 5'];
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.starsMax')).toBeInTheDocument();
        });
    });

    it('shows generic validation error for unknown 400 error', async () => {
        const setRanking = jest.fn();
        const error = new Error('Bad Request') as any;
        error.statusCode = 400;
        error.validationErrors = ['Some unknown validation error'];
        mockCreate.mockResolvedValue(error);

        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('Some unknown validation error')).toBeInTheDocument();
        });
    });

    it('resets form when modal is closed', async () => {
        const setRanking = jest.fn();
        const { rerender } = render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');

        await userEvent.type(usernameInput, 'Test User');
        await userEvent.type(commentTextarea, 'Great portfolio!');

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        rerender(<BoxRating ranking={false} setRanking={setRanking} />);
        rerender(<BoxRating ranking={true} setRanking={setRanking} />);

        const newUsernameInput = screen.getByLabelText('rating.name');
        const newCommentTextarea = screen.getByLabelText('rating.comment');

        expect(newUsernameInput).toHaveValue('');
        expect(newCommentTextarea).toHaveValue('');
    });

    it('handles onChange with null value for rating', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[2]);
            expect(screen.getByText('terminal.rating.1_5')).toBeInTheDocument();

            fireEvent.click(stars[0]);
            expect(screen.getByText('terminal.rating.0_5')).toBeInTheDocument();
        }
    });

    it('uses fallback aria-labels when translation returns falsy', () => {
        mockT.mockImplementation(() => '');
        const setRanking = jest.fn();
        const { container } = render(<BoxRating ranking={true} setRanking={setRanking} />);

        const closeButton = screen.getByLabelText('Close rating modal');
        const submitButton = screen.getByLabelText('Submit rating');

        expect(closeButton).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });
});
