import { render, screen } from '@testing-library/react';
import Debug from '../../src/app/components/Terminal/Debug';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('react-icons/vsc', () => ({
    VscChevronRight: () => <div data-testid="chevron-icon" />,
}));

describe('Debug', () => {
    it('renders debug component with default props', () => {
        render(<Debug />);

        expect(screen.getByText('terminal.debug')).toBeInTheDocument();
        expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });

    it('renders with explicit language prop', () => {
        render(<Debug language="pt" />);

        expect(screen.getByText('terminal.debug')).toBeInTheDocument();
    });
});