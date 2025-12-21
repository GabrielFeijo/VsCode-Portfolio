import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

const consoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = consoleError;
});

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@mui/material', () => ({
    Rating: ({ onChange, value, emptyIcon, ...props }: any) => (
        <div data-testid="rating" {...props}>
            <button onClick={() => onChange(null, 5)}>Rate 5</button>
            <button onClick={() => onChange(null, null)}>Rate null</button>
        </div>
    ),
}));

jest.mock('@mui/icons-material', () => ({
    Star: () => <div data-testid="star" />,
    StarBorder: () => <div data-testid="star-border" />,
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));
const { useTheme } = require('../../src/contexts/ThemeContext');
const mockUseTheme = useTheme;

jest.mock('../../src/services/api/review/ReviewService', () => ({
    ReviewService: {
        create: jest.fn(),
    },
}));

jest.mock('../../src/app/components/Rating/BoxRating.module.css', () => ({
    modalContainer: 'modalContainer',
    modal: 'modal',
    dark: 'dark',
    modalHeader: 'modalHeader',
    title: 'title',
    closeButton: 'closeButton',
    modalContent: 'modalContent',
    formField: 'formField',
    label: 'label',
    input: 'input',
    error: 'error',
    textarea: 'textarea',
    ratingContainer: 'ratingContainer',
    submitButton: 'submitButton',
    errorMessage: 'errorMessage',
    errorSpan: 'errorSpan',
}));

const mockT = jest.fn();
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

import BoxRating from '../../src/app/components/Rating/BoxRating';

describe('BoxRating', () => {
    const defaultProps = {
        ranking: true,
        setRanking: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockUseTheme.mockReturnValue({ theme: 'light' });
        mockT.mockImplementation((key) => key);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('renders nothing when ranking is false', () => {
        const { container } = render(<BoxRating {...defaultProps} ranking={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders modal when ranking is true', () => {
        render(<BoxRating {...defaultProps} />);
        expect(screen.getByText('rating.evaluate')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.name')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.comment')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rating\.submit/ })).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
        render(<BoxRating {...defaultProps} />);
        const closeButton = screen.getByRole('button', { name: /rating\.close/ });
        fireEvent.click(closeButton);
        expect(defaultProps.setRanking).toHaveBeenCalledWith(false);
    });

    it('updates username on input change', () => {
        render(<BoxRating {...defaultProps} />);
        const usernameInput = screen.getByLabelText('rating.name');
        fireEvent.change(usernameInput, { target: { value: 'John' } });
        expect(usernameInput).toHaveValue('John');
    });

    it('updates comment on textarea change', () => {
        render(<BoxRating {...defaultProps} />);
        const commentTextarea = screen.getByLabelText('rating.comment');
        fireEvent.change(commentTextarea, { target: { value: 'Great!' } });
        expect(commentTextarea).toHaveValue('Great!');
    });

    it('sets star rating', () => {
        render(<BoxRating {...defaultProps} />);
        const rateButton = screen.getByText('Rate 5');
        fireEvent.click(rateButton);
        expect(screen.getByText('terminal.rating.5')).toBeInTheDocument();
    });

    it('shows error when submitting with incomplete data', async () => {
        render(<BoxRating {...defaultProps} />);
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });
        act(() => {
            fireEvent.click(submitButton);
        });
        expect(await screen.findByText('rating.errors.usernameMin')).toBeInTheDocument();
        expect(screen.getByText('rating.errors.commentMin')).toBeInTheDocument();
        expect(screen.getByText('rating.error')).toBeInTheDocument();
    });

    it('submits review successfully', async () => {
        const mockCreate = require('../../src/services/api/review/ReviewService').ReviewService.create;
        mockCreate.mockResolvedValue({});

        render(<BoxRating {...defaultProps} />);
        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const rateButton = screen.getByText('Rate 5');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.change(usernameInput, { target: { value: 'John' } });
        fireEvent.change(commentTextarea, { target: { value: 'This is a great comment that meets the minimum length requirement!' } });
        fireEvent.click(rateButton);
        fireEvent.click(submitButton);

        await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
            username: 'John',
            comment: 'This is a great comment that meets the minimum length requirement!',
            stars: 5,
        }));
        expect(defaultProps.setRanking).toHaveBeenCalledWith(false);
    });

    it('handles review creation error', async () => {
        const mockCreate = require('../../src/services/api/review/ReviewService').ReviewService.create;
        mockCreate.mockResolvedValue(new Error('Failed'));

        render(<BoxRating {...defaultProps} />);
        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const rateButton = screen.getByText('Rate 5');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.change(usernameInput, { target: { value: 'John' } });
        fireEvent.change(commentTextarea, { target: { value: 'This is a great comment that meets the minimum length requirement!' } });
        fireEvent.click(rateButton);
        act(() => {
            fireEvent.click(submitButton);
        });

        expect(await screen.findByText('rating.errors.unknownError')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1500);
        });
        await waitFor(() => expect(screen.queryByText('rating.errors.unknownError')).not.toBeInTheDocument());
    });

    it('does not apply dark class in light theme', () => {
        mockUseTheme.mockReturnValue({ theme: 'light' });

        render(<BoxRating {...defaultProps} />);
        const modal = screen.getByText('rating.evaluate').closest('.modal');
        expect(modal).not.toHaveClass('dark');
    });

    it('clears error message after timeout', async () => {
        const mockCreate = require('../../src/services/api/review/ReviewService').ReviewService.create;
        mockCreate.mockResolvedValue(new Error('Failed'));

        render(<BoxRating {...defaultProps} />);
        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');
        const rateButton = screen.getByText('Rate 5');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.change(usernameInput, { target: { value: 'John' } });
        fireEvent.change(commentTextarea, { target: { value: 'This is a great comment that meets the minimum length requirement!' } });
        fireEvent.click(rateButton);
        fireEvent.click(submitButton);

        expect(await screen.findByText('rating.errors.unknownError')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1500);
        });
        await waitFor(() => expect(screen.queryByText('rating.errors.unknownError')).not.toBeInTheDocument());
    });

    it('handles all input fields separately', () => {
        render(<BoxRating {...defaultProps} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const commentTextarea = screen.getByLabelText('rating.comment');

        fireEvent.change(usernameInput, { target: { name: 'username', value: 'Test User' } });
        fireEvent.change(commentTextarea, { target: { name: 'comment', value: 'Test Comment' } });

        expect(usernameInput).toHaveValue('Test User');
        expect(commentTextarea).toHaveValue('Test Comment');
    });

    it('shows error when only username is filled', async () => {
        render(<BoxRating {...defaultProps} />);

        const usernameInput = screen.getByLabelText('rating.name');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.change(usernameInput, { target: { value: 'John' } });
        act(() => {
            fireEvent.click(submitButton);
        });

        expect(await screen.findByText('rating.errors.commentMin')).toBeInTheDocument();
        expect(screen.getByText('rating.error')).toBeInTheDocument();
    });

    it('shows error when only comment is filled', async () => {
        render(<BoxRating {...defaultProps} />);

        const commentTextarea = screen.getByLabelText('rating.comment');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.change(commentTextarea, { target: { value: 'This is a great comment that meets the minimum length requirement!' } });
        act(() => {
            fireEvent.click(submitButton);
        });

        expect(await screen.findByText('rating.errors.usernameMin')).toBeInTheDocument();
        expect(screen.getByText('rating.error')).toBeInTheDocument();
    });

    it('shows error when only rating is filled', async () => {
        render(<BoxRating {...defaultProps} />);

        const rateButton = screen.getByText('Rate 5');
        const submitButton = screen.getByRole('button', { name: /rating\.submit/ });

        fireEvent.click(rateButton);
        act(() => {
            fireEvent.click(submitButton);
        });

        expect(await screen.findByText('rating.errors.usernameMin')).toBeInTheDocument();
        expect(screen.getByText('rating.errors.commentMin')).toBeInTheDocument();
    });

    it('renders all required form elements', () => {
        render(<BoxRating {...defaultProps} />);

        expect(screen.getByText('rating.evaluate')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.name')).toBeInTheDocument();
        expect(screen.getByLabelText('rating.comment')).toBeInTheDocument();
        expect(screen.getByTestId('rating')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rating\.close/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rating\.submit/ })).toBeInTheDocument();
    });

    it('uses default aria-label when translation is missing for close', () => {
        mockT.mockImplementation((key) => key === 'rating.close' ? undefined : key);

        render(<BoxRating {...defaultProps} />);

        const closeButton = screen.getByRole('button', { name: 'Close rating modal' });
        expect(closeButton).toBeInTheDocument();

        mockT.mockImplementation((key) => key);
    });

    it('uses default aria-label when translation is missing for submit', () => {
        mockT.mockImplementation((key) => key === 'rating.submit' ? undefined : key);

        render(<BoxRating {...defaultProps} />);

        const submitButton = screen.getByRole('button', { name: 'Submit rating' });
        expect(submitButton).toBeInTheDocument();

        mockT.mockImplementation((key) => key);
    });

    it('does not set star when rating is null', () => {
        render(<BoxRating {...defaultProps} />);

        const rateNullButton = screen.getByText('Rate null');
        fireEvent.click(rateNullButton);
        expect(screen.queryByText(/terminal\.rating/)).not.toBeInTheDocument();
    });
});