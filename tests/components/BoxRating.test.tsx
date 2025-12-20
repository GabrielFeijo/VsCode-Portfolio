import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.useFakeTimers();

const mockCreate = jest.fn();
jest.mock('../../src/services/api/review/ReviewService', () => ({
    ReviewService: {
        create: mockCreate,
    },
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

    it('applies dark mode class when theme is dark', () => {
        useTheme.mockReturnValue({ theme: 'dark' });
        const setRanking = jest.fn();
        render(<BoxRating ranking={true} setRanking={setRanking} />);

        const modal = screen.getByText('rating.evaluate').closest('.modal');
        expect(modal).toHaveClass('dark');
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
                stars: 1, // 1 Star
            });
        });

        expect(setRanking).toHaveBeenCalledWith(false);
    });

    it('logs error when ReviewService.create fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const setRanking = jest.fn();
        mockCreate.mockResolvedValue(new Error('API Error'));

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
            expect(consoleSpy).toHaveBeenCalledWith('API Error');
        });

        consoleSpy.mockRestore();
    });
});
