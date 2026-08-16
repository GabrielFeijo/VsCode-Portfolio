import { render, screen, fireEvent } from '@testing-library/react';
import { useLayoutContext, LayoutProvider } from '../../src/contexts/LayoutContext';

jest.mock('react-device-detect', () => ({
    isMobile: false,
    isBrowser: true,
}));

function TestConsumer() {
    const ctx = useLayoutContext();
    return (
        <div>
            <span data-testid="expanded">{String(ctx.expanded)}</span>
            <span data-testid="terminal">{String(ctx.terminal)}</span>
            <span data-testid="ranking">{String(ctx.ranking)}</span>
            <button data-testid="toggle-explorer" onClick={ctx.toggleExplorer}>Toggle Explorer</button>
            <button data-testid="toggle-terminal" onClick={ctx.toggleTerminal}>Toggle Terminal</button>
            <button data-testid="set-ranking-true" onClick={() => ctx.setRanking(true)}>Show Ranking</button>
            <button data-testid="set-expanded-false" onClick={() => ctx.setExpanded(false)}>Close Explorer</button>
            <button data-testid="set-terminal-false" onClick={() => ctx.setTerminal(false)}>Close Terminal</button>
        </div>
    );
}

describe('LayoutContext', () => {
    it('throws when used outside LayoutProvider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestConsumer />)).toThrow();
        spy.mockRestore();
    });

    it('provides default values from isBrowser and isMobile', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('expanded').textContent).toBe('true');
        expect(screen.getByTestId('terminal').textContent).toBe('true');
        expect(screen.getByTestId('ranking').textContent).toBe('false');
    });

    it('toggleExplorer flips expanded state', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('expanded').textContent).toBe('true');
        fireEvent.click(screen.getByTestId('toggle-explorer'));
        expect(screen.getByTestId('expanded').textContent).toBe('false');
        fireEvent.click(screen.getByTestId('toggle-explorer'));
        expect(screen.getByTestId('expanded').textContent).toBe('true');
    });

    it('toggleTerminal flips terminal state', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('terminal').textContent).toBe('true');
        fireEvent.click(screen.getByTestId('toggle-terminal'));
        expect(screen.getByTestId('terminal').textContent).toBe('false');
        fireEvent.click(screen.getByTestId('toggle-terminal'));
        expect(screen.getByTestId('terminal').textContent).toBe('true');
    });

    it('setRanking updates ranking state', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('ranking').textContent).toBe('false');
        fireEvent.click(screen.getByTestId('set-ranking-true'));
        expect(screen.getByTestId('ranking').textContent).toBe('true');
    });

    it('setExpanded(false) closes the explorer', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('expanded').textContent).toBe('true');
        fireEvent.click(screen.getByTestId('set-expanded-false'));
        expect(screen.getByTestId('expanded').textContent).toBe('false');
    });

    it('setTerminal(false) closes the terminal', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        expect(screen.getByTestId('terminal').textContent).toBe('true');
        fireEvent.click(screen.getByTestId('set-terminal-false'));
        expect(screen.getByTestId('terminal').textContent).toBe('false');
    });

    it('multiple toggles maintain correct state sequence', () => {
        render(
            <LayoutProvider>
                <TestConsumer />
            </LayoutProvider>
        );
        fireEvent.click(screen.getByTestId('toggle-explorer'));
        fireEvent.click(screen.getByTestId('toggle-explorer'));
        fireEvent.click(screen.getByTestId('toggle-explorer'));
        expect(screen.getByTestId('expanded').textContent).toBe('false');
    });
});
