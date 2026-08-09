import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MetadataComponent from '../../src/app/layout/Metadata';

jest.mock('react-helmet-async', () => ({
	Helmet: ({ children }: any) => <div data-testid='helmet'>{children}</div>,
}));

function renderMetadata(path = '/') {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<MetadataComponent />
		</MemoryRouter>
	);
}

describe('MetadataComponent', () => {
	it('renders concise metadata for the home page', () => {
		renderMetadata();

		expect(document.querySelector('title')).toHaveTextContent(
			'Gabriel Feijó | Desenvolvedor Full Stack'
		);
		expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
			'content',
			expect.stringContaining('Portfólio de Gabriel Feijó')
		);
		expect(document.querySelector('meta[name="author"]')).toHaveAttribute(
			'content',
			'Gabriel Feijó'
		);
		expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
			'content',
			'index, follow, max-image-preview:large'
		);
	});

	it('sets route-specific title, description, and canonical URL', () => {
		renderMetadata('/projects');

		expect(document.querySelector('title')).toHaveTextContent(
			'Projetos Full Stack | Gabriel Feijó'
		);
		expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://www.gabrielfeijo.com.br/projects'
		);
		expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
			'content',
			'https://www.gabrielfeijo.com.br/projects'
		);
	});

	it('uses English metadata after the language changes', () => {
		renderMetadata('/en/experience');

		expect(document.querySelector('title')).toHaveTextContent(
			'Professional experience | Gabriel Feijó'
		);
		expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute(
			'content',
			'en_US'
		);
		expect(
			document.querySelector('meta[property="og:locale:alternate"]')
		).toHaveAttribute('content', 'pt_BR');
	});

	it('publishes bidirectional language alternates and x-default', () => {
		renderMetadata('/en/projects');

		expect(document.querySelector('link[hreflang="pt-BR"]')).toHaveAttribute(
			'href',
			'https://www.gabrielfeijo.com.br/projects'
		);
		expect(document.querySelector('link[hreflang="en"]')).toHaveAttribute(
			'href',
			'https://www.gabrielfeijo.com.br/en/projects'
		);
		expect(document.querySelector('link[hreflang="x-default"]')).toHaveAttribute(
			'href',
			'https://www.gabrielfeijo.com.br/projects'
		);
	});

	it('sets complete Open Graph and Twitter image metadata', () => {
		renderMetadata('/about-me');
		const imageUrl = 'https://www.gabrielfeijo.com.br/og-image.png';

		expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
			'content',
			imageUrl
		);
		expect(
			document.querySelector('meta[property="og:image:secure_url"]')
		).toHaveAttribute('content', imageUrl);
		expect(document.querySelector('meta[property="og:image:type"]')).toHaveAttribute(
			'content',
			'image/png'
		);
		expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);
		expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
			'content',
			imageUrl
		);
	});

	it('publishes connected Person, WebSite, and ProfilePage structured data', () => {
		renderMetadata('/about-me');
		const script = document.querySelector('script[type="application/ld+json"]');
		const structuredData = JSON.parse(script?.textContent || '{}');
		const [person, website, page] = structuredData['@graph'];

		expect(person['@type']).toBe('Person');
		expect(person['@id']).toBe('https://www.gabrielfeijo.com.br/#person');
		expect(person.sameAs).toContain('https://github.com/GabrielFeijo');
		expect(website['@type']).toBe('WebSite');
		expect(page['@type']).toBe('ProfilePage');
		expect(page.url).toBe('https://www.gabrielfeijo.com.br/about-me');
	});
});
