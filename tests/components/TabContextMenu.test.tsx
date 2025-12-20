import { render, screen, fireEvent } from '@testing-library/react';
import TabContextMenu from '../../src/app/components/TabContextMenu/TabContextMenu';

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
    VscChromeClose: () => <div data-testid="close-icon" />,
    VscCloseAll: () => <div data-testid="close-all-icon" />,
}));

jest.mock('react-icons/md', () => ({
    MdChevronRight: () => <div data-testid="chevron-right-icon" />,
    MdChevronLeft: () => <div data-testid="chevron-left-icon" />,
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const mockUseTheme = require('../../src/contexts/ThemeContext').useTheme;
const mockUseTranslation = require('react-i18next').useTranslation;

describe('TabContextMenu', () => {
    const defaultProps = {
        contextMenu: { mouseX: 100, mouseY: 200 },
        currentTabIndex: 1,
        visiblePageIndexes: [0, 1, 2, 3],
        handleClose: jest.fn(),
        handleCloseTab: jest.fn(),
        handleCloseOthers: jest.fn(),
        handleCloseToRight: jest.fn(),
        handleCloseToLeft: jest.fn(),
        handleCloseAll: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTheme.mockReturnValue({ theme: 'light' });
        mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    });

    it('renders nothing when contextMenu is null', () => {
        const { container } = render(<TabContextMenu {...defaultProps} contextMenu={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders context menu when contextMenu is provided', () => {
        render(<TabContextMenu {...defaultProps} />);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('tabContextMenu.close')).toBeInTheDocument();
        expect(screen.getByText('tabContextMenu.closeOthers')).toBeInTheDocument();
        expect(screen.getByText('tabContextMenu.closeToRight')).toBeInTheDocument();
        expect(screen.getByText('tabContextMenu.closeToLeft')).toBeInTheDocument();
        expect(screen.getByText('tabContextMenu.closeAll')).toBeInTheDocument();
    });

    it('calls handleCloseTab and handleClose when close button is clicked', () => {
        render(<TabContextMenu {...defaultProps} />);
        const closeButton = screen.getByLabelText('tabContextMenu.close');
        fireEvent.click(closeButton);
        expect(defaultProps.handleCloseTab).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls handleCloseOthers and handleClose when close others button is clicked', () => {
        render(<TabContextMenu {...defaultProps} />);
        const closeOthersButton = screen.getByLabelText('tabContextMenu.closeOthers');
        fireEvent.click(closeOthersButton);
        expect(defaultProps.handleCloseOthers).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls handleCloseToRight and handleClose when close to right button is clicked', () => {
        render(<TabContextMenu {...defaultProps} />);
        const closeToRightButton = screen.getByLabelText('tabContextMenu.closeToRight');
        fireEvent.click(closeToRightButton);
        expect(defaultProps.handleCloseToRight).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls handleCloseToLeft and handleClose when close to left button is clicked', () => {
        render(<TabContextMenu {...defaultProps} />);
        const closeToLeftButton = screen.getByLabelText('tabContextMenu.closeToLeft');
        fireEvent.click(closeToLeftButton);
        expect(defaultProps.handleCloseToLeft).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls handleCloseAll and handleClose when close all button is clicked', () => {
        render(<TabContextMenu {...defaultProps} />);
        const closeAllButton = screen.getByLabelText('tabContextMenu.closeAll');
        fireEvent.click(closeAllButton);
        expect(defaultProps.handleCloseAll).toHaveBeenCalledTimes(1);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('disables close others when no other tabs', () => {
        render(<TabContextMenu {...defaultProps} visiblePageIndexes={[1]} />);
        const closeOthersButton = screen.getByLabelText('tabContextMenu.closeOthers');
        expect(closeOthersButton).toBeDisabled();
    });

    it('disables close to right when no tabs to right', () => {
        render(<TabContextMenu {...defaultProps} currentTabIndex={3} visiblePageIndexes={[0, 1, 2, 3]} />);
        const closeToRightButton = screen.getByLabelText('tabContextMenu.closeToRight');
        expect(closeToRightButton).toBeDisabled();
    });

    it('disables close to left when no tabs to left', () => {
        render(<TabContextMenu {...defaultProps} currentTabIndex={0} visiblePageIndexes={[0, 1, 2, 3]} />);
        const closeToLeftButton = screen.getByLabelText('tabContextMenu.closeToLeft');
        expect(closeToLeftButton).toBeDisabled();
    });

    it('calls handleClose on escape key', () => {
        render(<TabContextMenu {...defaultProps} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call handleClose on other keys', () => {
        render(<TabContextMenu {...defaultProps} />);
        fireEvent.keyDown(document, { key: 'Enter' });
        expect(defaultProps.handleClose).not.toHaveBeenCalled();
    });

    it('adds event listeners when contextMenu is not null', () => {
        const original = document.addEventListener;
        const spy = jest.spyOn(document, 'addEventListener');
        spy.mockImplementation((...args) => original.apply(document, args));
        render(<TabContextMenu {...defaultProps} />);
        expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
        spy.mockRestore();
    });

    it('calls handleClose when clicking outside the menu (mousedown)', () => {
        render(<TabContextMenu {...defaultProps} />);
        fireEvent.mouseDown(document.body);
        expect(defaultProps.handleClose).toHaveBeenCalledTimes(1);
    });

    it('applies dark mode class when theme is dark', () => {
        mockUseTheme.mockReturnValue({ theme: 'dark' });
        const { container } = render(<TabContextMenu {...defaultProps} />);
        const menu = container.querySelector('[role="menu"]');
        expect(menu?.parentElement?.className).toMatch(/dark/);
    });

    it('positions the menu at the specified coordinates', () => {
        const { container } = render(<TabContextMenu {...defaultProps} />);
        const menu = container.querySelector('[role="menu"]');
        expect(menu?.parentElement).toHaveStyle({ top: '200px', left: '100px' });
    });

    it('renders with correct aria-labels using translation', () => {
        render(<TabContextMenu {...defaultProps} />);
        expect(screen.getByLabelText('tabContextMenu.close')).toBeInTheDocument();
        expect(screen.getByLabelText('tabContextMenu.closeOthers')).toBeInTheDocument();
        expect(screen.getByLabelText('tabContextMenu.closeToRight')).toBeInTheDocument();
        expect(screen.getByLabelText('tabContextMenu.closeToLeft')).toBeInTheDocument();
        expect(screen.getByLabelText('tabContextMenu.closeAll')).toBeInTheDocument();
    });

    it('uses fallback aria-labels when translation returns falsy', () => {
        mockUseTranslation.mockReturnValue({ t: () => '' });
        render(<TabContextMenu {...defaultProps} />);
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
        expect(screen.getByLabelText('Close Others')).toBeInTheDocument();
        expect(screen.getByLabelText('Close to the Right')).toBeInTheDocument();
        expect(screen.getByLabelText('Close to the Left')).toBeInTheDocument();
        expect(screen.getByLabelText('Close All')).toBeInTheDocument();
    });
});
