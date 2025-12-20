import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import KeyboardShortcutsModal from '../../src/app/components/KeyboardShortcutsModal/KeyboardShortcutsModal';

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

jest.mock('react-device-detect', () => ({
    isMobile: false,
}));

jest.mock('react-icons/vsc', () => ({
    VscTerminal: () => <div data-testid="terminal-icon" />,
    VscColorMode: () => <div data-testid="color-mode-icon" />,
    VscHome: () => <div data-testid="home-icon" />,
    VscGlobe: () => <div data-testid="globe-icon" />,
    VscChromeClose: () => <div data-testid="close-icon" />,
    VscEditorLayout: () => <div data-testid="layout-icon" />,
    VscSave: () => <div data-testid="save-icon" />,
}));

describe('KeyboardShortcutsModal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('renders nothing when visible is false', () => {
        const { container } = render(<KeyboardShortcutsModal visible={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing on mobile', () => {
        jest.mock('react-device-detect', () => ({
            isMobile: true,
        }), { virtual: true });

        const KeyboardShortcutsModalMobile = require('../../src/app/components/KeyboardShortcutsModal/KeyboardShortcutsModal').default;

        const { container } = render(<KeyboardShortcutsModalMobile visible={true} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders modal after timeout when visible is true', async () => {
        render(<KeyboardShortcutsModal visible={true} />);

        expect(screen.queryByText('shortcuts.title')).not.toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2500);
        });

        expect(screen.getByText('shortcuts.title')).toBeInTheDocument();

        expect(screen.getByText('shortcuts.terminal')).toBeInTheDocument();
        expect(screen.getByText('shortcuts.theme')).toBeInTheDocument();
        expect(screen.getByText('shortcuts.language')).toBeInTheDocument();
        expect(screen.getByText('shortcuts.sidebar')).toBeInTheDocument();
        expect(screen.getByText('shortcuts.home')).toBeInTheDocument();
        expect(screen.getByText('shortcuts.save')).toBeInTheDocument();
    });

    it('hides modal after 5 seconds', async () => {
        render(<KeyboardShortcutsModal visible={true} />);

        act(() => {
            jest.advanceTimersByTime(2500);
        });
        expect(screen.getByText('shortcuts.title')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5000);
        });
        await waitFor(() => expect(screen.queryByText('shortcuts.title')).not.toBeInTheDocument());
    });

    it('closes modal when close button is clicked', async () => {
        render(<KeyboardShortcutsModal visible={true} />);

        act(() => {
            jest.advanceTimersByTime(2500);
        });
        expect(screen.getByText('shortcuts.title')).toBeInTheDocument();

        const closeButton = screen.getByRole('button', { name: /shortcuts\.close/ });
        fireEvent.click(closeButton);

        await waitFor(() => expect(screen.queryByText('shortcuts.title')).not.toBeInTheDocument());
    });

    it('clears timeouts on unmount', () => {
        const { unmount } = render(<KeyboardShortcutsModal visible={true} />);

        jest.advanceTimersByTime(1000);

        unmount();

        expect(screen.queryByText('shortcuts.title')).not.toBeInTheDocument();
    });
});