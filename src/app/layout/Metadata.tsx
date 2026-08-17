import { Helmet } from 'react-helmet-async';
import { getPageMetadata } from '../../config/seo';
import { siteConfig } from '../../config/site';
import { useLocation } from 'react-router-dom';

const localeByLanguage = {
	pt: 'pt_BR',
	en: 'en_US',
} as const;

const htmlLanguageByLanguage = {
	pt: 'pt-BR',
	en: 'en',
} as const;

export default function MetadataComponent() {
	const { pathname } = useLocation();
	const metadata = getPageMetadata(pathname);
	const { language } = metadata;
	const siteImage = `${siteConfig.url}${siteConfig.image}`;
	const locale = localeByLanguage[language];
	const alternateLocale = language === 'pt' ? 'en_US' : 'pt_BR';
	const pageType = metadata.path === '/about-me' ? 'ProfilePage' : 'WebPage';

	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Person',
				'@id': `${siteConfig.url}/#person`,
				name: siteConfig.author,
				url: siteConfig.url,
				image: siteImage,
				jobTitle: 'Desenvolvedor Full Stack',
				address: {
					'@type': 'PostalAddress',
					addressLocality: 'Recife',
					addressRegion: 'PE',
					addressCountry: 'BR',
				},
				sameAs: [
					siteConfig.githubUrl,
					siteConfig.linkedinUrl,
				],
				knowsAbout: [
					'React',
					'TypeScript',
					'Node.js',
					'NestJS',
					'Software Engineering',
					'Full Stack Development',
				],
			},
			{
				'@type': 'WebSite',
				'@id': `${siteConfig.url}/#website`,
				url: siteConfig.url,
				name: siteConfig.name,
				description: siteConfig.description,
				inLanguage: ['pt-BR', 'en'],
				author: { '@id': `${siteConfig.url}/#person` },
			},
			{
				'@type': pageType,
				'@id': `${metadata.canonicalUrl}#webpage`,
				url: metadata.canonicalUrl,
				name: metadata.title,
				description: metadata.description,
				inLanguage: htmlLanguageByLanguage[language],
				isPartOf: { '@id': `${siteConfig.url}/#website` },
				about: { '@id': `${siteConfig.url}/#person` },
			},
		],
	};

	return (
		<Helmet htmlAttributes={{ lang: htmlLanguageByLanguage[language] }}>
			<title>{metadata.title}</title>
			<meta
				name='description'
				content={metadata.description}
			/>
			<meta
				name='author'
				content={siteConfig.author}
			/>
			<meta
				name='theme-color'
				content='#1e1e2e'
			/>
			<meta
				name='robots'
				content='index, follow, max-image-preview:large'
			/>

			<link
				rel='canonical'
				href={metadata.canonicalUrl}
			/>
			<link
				rel='alternate'
				hrefLang='pt-BR'
				href={metadata.alternateUrls.pt}
			/>
			<link
				rel='alternate'
				hrefLang='en'
				href={metadata.alternateUrls.en}
			/>
			<link
				rel='alternate'
				hrefLang='x-default'
				href={metadata.alternateUrls.xDefault}
			/>

			<meta
				property='og:type'
				content='website'
			/>
			<meta
				property='og:url'
				content={metadata.canonicalUrl}
			/>
			<meta
				property='og:title'
				content={metadata.title}
			/>
			<meta
				property='og:description'
				content={metadata.description}
			/>
			<meta
				property='og:image'
				content={siteImage}
			/>
			<meta
				property='og:image:secure_url'
				content={siteImage}
			/>
			<meta
				property='og:image:type'
				content='image/png'
			/>
			<meta
				property='og:image:width'
				content='1200'
			/>
			<meta
				property='og:image:height'
				content='630'
			/>
			<meta
				property='og:image:alt'
				content='Gabriel Feijó — Desenvolvedor Full Stack'
			/>
			<meta
				property='og:locale'
				content={locale}
			/>
			<meta
				property='og:locale:alternate'
				content={alternateLocale}
			/>
			<meta
				property='og:site_name'
				content={siteConfig.name}
			/>

			<meta
				name='twitter:card'
				content='summary_large_image'
			/>
			<meta
				name='twitter:url'
				content={metadata.canonicalUrl}
			/>
			<meta
				name='twitter:title'
				content={metadata.title}
			/>
			<meta
				name='twitter:description'
				content={metadata.description}
			/>
			<meta
				name='twitter:image'
				content={siteImage}
			/>
			<meta
				name='twitter:image:alt'
				content='Gabriel Feijó — Desenvolvedor Full Stack'
			/>
			<meta
				name='twitter:creator'
				content='@gabrielfeijo'
			/>

			<script type='application/ld+json'>{JSON.stringify(structuredData)}</script>
		</Helmet>
	);
}
