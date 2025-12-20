import { render } from '@testing-library/react';
import MetadataComponent from '../../src/app/layout/Metadata';

jest.mock('react-helmet-async', () => ({
    Helmet: ({ children }: any) => <div data-testid="helmet">{children}</div>,
}));

describe('MetadataComponent', () => {
    it('renders Helmet with metadata', () => {
        render(<MetadataComponent />);
        expect(document.querySelector('title')).toHaveTextContent('Gabriel Feijó | Desenvolvedor Full Stack');
        const metaDescription = document.querySelector('meta[name="description"]');
        expect(metaDescription).toHaveAttribute('content', expect.stringContaining('Portfolio interativo'));
    });
});