import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from '../../src/app/components/ContextMenu/ContextMenu';

const consoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = consoleError;
});

jest.mock('framer-motion', () => {
    const ReactLocal = require('react');
    return {
        motion: {
            div: ReactLocal.forwardRef(({ children, ...props }: any, ref: any) => (
                ReactLocal.createElement('div', { ref, ...props }, children)
            )),
        },
        AnimatePresence: ({ children }: any) => ReactLocal.createElement(ReactLocal.Fragment, null, children),
    };
});

jest.mock('react-icons/vsc', () => ({
    VscGithub: () => <div data-testid="github-icon" />,
    VscTrash: () => <div data-testid="trash-icon" />,
}));

jest.mock('react-icons/md', () => ({
    MdOpenInNew: () => <div data-testid="open-icon" />,
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const mockUseTheme = require('../../src/contexts/ThemeContext').useTheme;
const mockUseTranslation = require('react-i18next').useTranslation;

describe('ContextMenu', () => {
    const defaultProps = {
        contextMenu: { mouseX: 100, mouseY: 200 },
        handleOpenFile: jest.fn(),
        handleOpenFileOnGithub: jest.fn(),
        handleClose: jest.fn(),
        handleDelete: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTheme.mockReturnValue({ theme: 'light' });
        mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    });

    it('renders nothing when contextMenu is null', () => {
        const { container } = render(<ContextMenu {...defaultProps} contextMenu={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders context menu when contextMenu is provided', () => {
        render(<ContextMenu {...defaultProps} />);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('contextMenu.open')).toBeInTheDocument();
        expect(screen.getByText('contextMenu.delete')).toBeInTheDocument();
        expect(screen.getByText('contextMenu.openOnGithub')).toBeInTheDocument();
    });

    it('calls handleOpenFile when open button is clicked', () => {
        render(<ContextMenu {...defaultProps} />);
        const openButton = screen.getByLabelText('contextMenu.open');
        fireEvent.click(openButton);
        expect(defaultProps.handleOpenFile).toHaveBeenCalledTimes(1);
    });

    it('calls handleDelete when delete button is clicked', () => {
        render(<ContextMenu {...defaultProps} />);
        const deleteButton = screen.getByLabelText('contextMenu.delete');
        fireEvent.click(deleteButton);
        expect(defaultProps.handleDelete).toHaveBeenCalledTimes(1);
    });

    it('calls handleOpenFileOnGithub when github button is clicked', () => {
        render(<ContextMenu {...defaultProps} />);
        const githubButton = screen.getByLabelText('contextMenu.openOnGithub');
        fireEvent.click(githubButton);
        expect(defaultProps.handleOpenFileOnGithub).toHaveBeenCalledTimes(1);
    });

    it('does not call handleClose when clicking inside the menu', () => {
        render(<ContextMenu {...defaultProps} />);
        const menu = screen.getByRole('menu');
        fireEvent.mouseDown(menu);
        expect(defaultProps.handleClose).not.toHaveBeenCalled();
    });

    it('calls handleClose when clicking outside the menu (mousedown)', () => {
        render(<ContextMenu {...defaultProps} />);
        fireEvent.mouseDown(document.body);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('adds mousedown listener when contextMenu is not null', () => {
        const original = document.addEventListener;
        const spy = jest.spyOn(document, 'addEventListener');
        spy.mockImplementation((...args) => original.apply(document, args));
        render(<ContextMenu {...defaultProps} />);
        expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        spy.mockRestore();
    });

    it('applies dark mode class when theme is dark', () => {
        mockUseTheme.mockReturnValue({ theme: 'dark' });
        const { container } = render(<ContextMenu {...defaultProps} />);
        const menu = container.querySelector('[role="menu"]');
        expect(menu?.parentElement).toHaveClass('dark');
    });

    it('positions the menu at the specified coordinates', () => {
        const { container } = render(<ContextMenu {...defaultProps} />);
        const menu = container.querySelector('[role="menu"]');
        expect(menu?.parentElement).toHaveStyle({ top: '200px', left: '100px' });
    });

    it('renders with correct aria-labels using translation', () => {
        render(<ContextMenu {...defaultProps} />);
        expect(screen.getByLabelText('contextMenu.open')).toBeInTheDocument();
        expect(screen.getByLabelText('contextMenu.delete')).toBeInTheDocument();
        expect(screen.getByLabelText('contextMenu.openOnGithub')).toBeInTheDocument();
    });

    it('uses fallback aria-labels when translation returns falsy', () => {
        mockUseTranslation.mockReturnValue({ t: () => '' });
        const { rerender } = render(<ContextMenu {...defaultProps} />);
        expect(screen.getByLabelText('Open file')).toBeInTheDocument();
        expect(screen.getByLabelText('Delete file')).toBeInTheDocument();
        expect(screen.getByLabelText('Open file on GitHub')).toBeInTheDocument();
        rerender(<ContextMenu {...defaultProps} />);
    });
});
