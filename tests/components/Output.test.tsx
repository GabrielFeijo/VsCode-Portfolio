import { render, screen } from '@testing-library/react';
import Output from '../../src/app/components/Terminal/Output';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'terminal.output' && options?.returnObjects) {
                return ['Message 1', 'Message 2'];
            }
            return key;
        },
    }),
}));

describe('Output', () => {
    it('renders output messages', () => {
        render(<Output language="en" />);

        expect(screen.getByText('Message 1')).toBeInTheDocument();
        expect(screen.getByText('Message 2')).toBeInTheDocument();
        expect(screen.getAllByText('[info]')).toHaveLength(2);
    });

    it('renders with different language', () => {
        render(<Output language="pt" />);

        expect(screen.getByText('Message 1')).toBeInTheDocument();
    });
});