import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

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

const { useTheme } = require('../../src/contexts/ThemeContext');
import BoxRating from '../../src/app/components/Rating/BoxRating';

describe('BoxRating component', () => {
    beforeEach(() => {
        mockCreate.mockClear();
        useTheme.mockReturnValue({ theme: 'light' });
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

    it('updates username input', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        fireEvent.change(usernameInput, { target: { value: 'Test User' } });

        expect(usernameInput).toHaveValue('Test User');
    });

    it('updates comment textarea', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const commentTextarea = screen.getByLabelText('rating.comment');
        fireEvent.change(commentTextarea, { target: { value: 'Great portfolio!' } });

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
        act(() => {
            fireEvent.click(submit);
        });

        expect(screen.getByText(/rating.error/i)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1500);
        });

        expect(screen.queryByText(/rating.error/i)).toBeNull();
    });

    it('closes the modal when close button is clicked', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const closeButton = screen.getByRole('button', { name: /rating.close/i });
        fireEvent.click(closeButton);

        expect(setRanking).toHaveBeenCalledWith(false);
    });

    it('applies error class to inputs when empty on submit', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const submit = screen.getByRole('button', { name: /rating.submit/i });
        fireEvent.click(submit);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');

        expect(usernameInput).toHaveClass('error');
        expect(commentTextarea).toHaveClass('error');
    });

    it('removes error class when inputs are filled', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const submit = screen.getByRole('button', { name: /rating.submit/i });

        fireEvent.click(submit);
        expect(usernameInput).toHaveClass('error');

        fireEvent.change(usernameInput, { target: { value: 'Test' } });
        fireEvent.change(commentTextarea, { target: { value: 'Comment' } });
    });

    it('removes error class when inputs are filled', () => {
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');

        fireEvent.change(usernameInput, { target: { value: 'Test' } });
        fireEvent.change(commentTextarea, { target: { value: 'Comment' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

        const stars = screen.getAllByRole('radio');
        if (stars.length > 1) {
            fireEvent.click(stars[1]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith({
                username: 'Test User',
                comment: 'Great!',
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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

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

        fireEvent.change(usernameInput, { target: { value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });

        const stars = screen.getAllByRole('radio');
        if (stars.length > 0) {
            fireEvent.click(stars[0]);
        }

        fireEvent.click(submit);

        await waitFor(() => {
            expect(screen.getByText('rating.errors.starsMax')).toBeInTheDocument();
        });
    });
});
