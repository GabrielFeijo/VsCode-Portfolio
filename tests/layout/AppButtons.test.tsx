import { render, screen, fireEvent } from '@testing-library/react';
import AppButtons from '../../src/app/layout/AppButtons';

jest.mock('@mui/system', () => ({
    styled: jest.fn(() => jest.fn(() => <div />)),
}));

jest.mock('@mui/material', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@mui/system', () => ({
    Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@mui/material/styles', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-icons/vsc', () => ({
    VscMarkdown: () => <div data-testid="vsc-markdown" />,
    VscChromeClose: () => <div data-testid="vsc-chrome-close" />,
}));

jest.mock('src/utils/convertFileName', () => ({
    convertFileName: jest.fn(),
}));

jest.mock('src/app/components/TabContextMenu/TabContextMenu', () => {
    return function MockTabContextMenu(props: any) {
        return (
            <div data-testid="tab-context-menu">
                <button data-testid="close-tab" onClick={props.handleCloseTab} />
                <button data-testid="close-others" onClick={props.handleCloseOthers} />
                <button data-testid="close-to-right" onClick={props.handleCloseToRight} />
                <button data-testid="close-to-left" onClick={props.handleCloseToLeft} />
                <button data-testid="close-all" onClick={props.handleCloseAll} />
                <button data-testid="close-menu" onClick={props.handleClose} />
            </div>
        );
    };
});

const mockUseNavigate = require('react-router-dom').useNavigate;
const mockUseTheme = require('@mui/material/styles').useTheme;
const mockConvertFileName = require('src/utils/convertFileName').convertFileName;

describe('AppButtons', () => {
    const defaultProps = {
        pages: [
            { index: 0, name: 'Home', route: 'home' },
            { index: 1, name: 'About', route: 'about' },
            { index: 2, name: 'Projects', route: 'projects' },
        ],
        selectedIndex: 0,
        setSelectedIndex: jest.fn(),
        currentComponent: 'Home',
        setCurrentComponent: jest.fn(),
        visiblePageIndexes: [0, 1, 2],
        setVisiblePageIndexes: jest.fn(),
    };

    beforeEach(() => {
        mockUseNavigate.mockReturnValue(jest.fn());
        mockUseTheme.mockReturnValue({
            palette: { mode: 'light' },
        });
        mockConvertFileName.mockImplementation((name: string) => name);
        defaultProps.setSelectedIndex.mockClear();
        defaultProps.setVisiblePageIndexes.mockClear();
        defaultProps.setCurrentComponent.mockClear();
    });

    it('renders buttons with dark theme', () => {
        mockUseTheme.mockReturnValue({
            palette: { mode: 'dark' },
        });
        render(<AppButtons {...defaultProps} />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('calls setSelectedIndex and navigate when button is clicked', () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.click(aboutButton);
        expect(defaultProps.setSelectedIndex).toHaveBeenCalledWith(1);
        expect(navigate).toHaveBeenCalledWith('/about');
    });

    it('calls setVisiblePageIndexes when close button is pressed with Enter', () => {
        render(<AppButtons {...defaultProps} />);
        const closeButtons = screen.getAllByLabelText(/Close/);
        fireEvent.keyDown(closeButtons[1], { key: 'Enter' });
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([0, 2]);
    });

    it('calls setVisiblePageIndexes when close button is pressed with Space', () => {
        render(<AppButtons {...defaultProps} />);
        const closeButtons = screen.getAllByLabelText(/Close/);
        fireEvent.keyDown(closeButtons[1], { key: ' ' });
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([0, 2]);
    });

    it('handles close tab from context menu', () => {
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.contextMenu(aboutButton, { clientX: 100, clientY: 200 });
        const closeTabButton = screen.getByTestId('close-tab');
        fireEvent.click(closeTabButton);
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([0, 2]);
    });

    it('handles close others from context menu', () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.contextMenu(aboutButton, { clientX: 100, clientY: 200 });
        const closeOthersButton = screen.getByTestId('close-others');
        fireEvent.click(closeOthersButton);
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([1]);
        expect(defaultProps.setSelectedIndex).toHaveBeenCalledWith(1);
        expect(navigate).toHaveBeenCalledWith('/about');
    });

    it('handles close to right from context menu', () => {
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.contextMenu(aboutButton, { clientX: 100, clientY: 200 });
        const closeToRightButton = screen.getByTestId('close-to-right');
        fireEvent.click(closeToRightButton);
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([0, 1]);
    });

    it('handles close to left from context menu', () => {
        render(<AppButtons {...defaultProps} />);
        const projectsButton = screen.getByText('Projects');
        fireEvent.contextMenu(projectsButton, { clientX: 100, clientY: 200 });
        const closeToLeftButton = screen.getByTestId('close-to-left');
        fireEvent.click(closeToLeftButton);
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([2]);
    });

    it('handles close all from context menu', () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.contextMenu(aboutButton, { clientX: 100, clientY: 200 });
        const closeAllButton = screen.getByTestId('close-all');
        fireEvent.click(closeAllButton);
        expect(defaultProps.setVisiblePageIndexes).toHaveBeenCalledWith([]);
        expect(navigate).toHaveBeenCalledWith('/');
    });

    it('closes context menu', () => {
        render(<AppButtons {...defaultProps} />);
        const aboutButton = screen.getByText('About');
        fireEvent.contextMenu(aboutButton, { clientX: 100, clientY: 200 });
        const closeMenuButton = screen.getByTestId('close-menu');
        fireEvent.click(closeMenuButton);
    });

    it('does not call setSelectedIndex when close button is clicked', () => {
        render(<AppButtons {...defaultProps} />);
        const closeButtons = screen.getAllByLabelText(/Close/);
        fireEvent.click(closeButtons[1]);
        expect(defaultProps.setSelectedIndex).not.toHaveBeenCalled();
    });
});