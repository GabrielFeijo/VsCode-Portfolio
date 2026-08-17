import { render, screen } from '@testing-library/react';
import Problems from '../../src/app/components/Terminal/Problems';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('Problems', () => {
    it('renders problems text with default props', () => {
        render(<Problems />);

        expect(screen.getByText('terminal.problems')).toBeInTheDocument();
    });

    it('renders with different language', () => {
        render(<Problems language="pt" />);

        expect(screen.getByText('terminal.problems')).toBeInTheDocument();
    });
});