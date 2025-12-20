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

    it('sets all basic meta tags', () => {
        render(<MetadataComponent />);
        expect(document.querySelector('meta[name="title"]')).toHaveAttribute('content', 'Gabriel Feijó | Desenvolvedor Full Stack');
        expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('desenvolvedor Full Stack'));
        expect(document.querySelector('meta[name="author"]')).toHaveAttribute('content', 'Gabriel Feijó');
        expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', '#282A36');
        expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute('content', expect.stringContaining('Gabriel Feijó'));
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
        expect(document.querySelector('meta[name="language"]')).toHaveAttribute('content', 'Portuguese');
        expect(document.querySelector('meta[name="revisit-after"]')).toHaveAttribute('content', '7 days');
        expect(document.querySelector('meta[name="rating"]')).toHaveAttribute('content', 'general');
    });

    it('sets canonical link', () => {
        render(<MetadataComponent />);
        expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.gabrielfeijo.com.br');
    });

    it('sets Open Graph meta tags', () => {
        render(<MetadataComponent />);
        expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website');
        expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://www.gabrielfeijo.com.br');
        expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Gabriel Feijó | Desenvolvedor Full Stack');
        expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute('content', expect.stringContaining('Portfolio interativo'));
        expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://www.gabrielfeijo.com.br/gg.png');
        expect(document.querySelector('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
        expect(document.querySelector('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
        expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
        expect(document.querySelector('meta[property="og:site_name"]')).toHaveAttribute('content', 'Gabriel Feijó');
    });

    it('sets Twitter meta tags', () => {
        render(<MetadataComponent />);
        expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
        expect(document.querySelector('meta[name="twitter:url"]')).toHaveAttribute('content', 'https://www.gabrielfeijo.com.br');
        expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', 'Gabriel Feijó | Desenvolvedor Full Stack');
        expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute('content', expect.stringContaining('Portfolio interativo'));
        expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://www.gabrielfeijo.com.br/gg.png');
        expect(document.querySelector('meta[name="twitter:creator"]')).toHaveAttribute('content', '@gabrielfeijo');
    });

    it('sets JSON-LD structured data', () => {
        render(<MetadataComponent />);
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        expect(scripts).toHaveLength(2);

        const personScript = scripts[0];
        const personData = JSON.parse(personScript.textContent || '{}');
        expect(personData['@type']).toBe('Person');
        expect(personData.name).toBe('Gabriel Feijó');
        expect(personData.jobTitle).toBe('Desenvolvedor Full Stack');
        expect(personData.address.addressLocality).toBe('Recife');
        expect(personData.sameAs).toEqual([
            'https://github.com/GabrielFeijo',
            'https://www.linkedin.com/in/gabriel-feijo/'
        ]);
        expect(personData.knowsAbout).toContain('React');

        const websiteScript = scripts[1];
        const websiteData = JSON.parse(websiteScript.textContent || '{}');
        expect(websiteData['@type']).toBe('WebSite');
        expect(websiteData.name).toBe('Gabriel Feijó | Desenvolvedor Full Stack');
        expect(websiteData.inLanguage).toBe('pt-BR');
    });
});