import { Helmet } from 'react-helmet-async';

const MetadataComponent = () => {
	const siteTitle = 'Gabriel Feijó | Desenvolvedor Full Stack';
	const siteDescription =
		'Portfolio interativo de Gabriel Feijó, desenvolvedor Full Stack especializado em React, TypeScript, Node.js e tecnologias modernas. Explore projetos, experiências e habilidades em um ambiente que simula o VS Code.';
	const siteUrl = 'https://www.gabrielfeijo.com.br';
	const siteImage = `${siteUrl}/gg.png`;
	const authorName = 'Gabriel Feijó';

	return (
		<Helmet>
			<title>{siteTitle}</title>
			<meta name="title" content={siteTitle} />
			<meta name="description" content={siteDescription} />
			<meta name="author" content={authorName} />
			<meta name="theme-color" content="#282A36" />

			<meta
				name="keywords"
				content="Gabriel Feijó, desenvolvedor full stack, programador React, TypeScript, Next.js, Node.js, desenvolvedor web, portfolio programador, desenvolvedor JavaScript, programador Recife, React developer,FullStack developer, desenvolvimento web moderno, API REST, PostgreSQL, MongoDB, desenvolvedor frontend, desenvolvedor backend, engenheiro de software"
			/>

			<link rel="canonical" href={siteUrl} />

			<meta property="og:type" content="website" />
			<meta property="og:url" content={siteUrl} />
			<meta property="og:title" content={siteTitle} />
			<meta property="og:description" content={siteDescription} />
			<meta property="og:image" content={siteImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta property="og:locale" content="pt_BR" />
			<meta property="og:site_name" content={authorName} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:url" content={siteUrl} />
			<meta name="twitter:title" content={siteTitle} />
			<meta name="twitter:description" content={siteDescription} />
			<meta name="twitter:image" content={siteImage} />
			<meta name="twitter:creator" content="@gabrielfeijo" />

			<meta name="robots" content="index, follow" />
			<meta name="language" content="Portuguese" />
			<meta name="revisit-after" content="7 days" />
			<meta name="rating" content="general" />

			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Person",
					"name": authorName,
					"url": siteUrl,
					"image": siteImage,
					"jobTitle": "Desenvolvedor Full Stack",
					"description": siteDescription,
					"address": {
						"@type": "PostalAddress",
						"addressLocality": "Recife",
						"addressRegion": "PE",
						"addressCountry": "BR"
					},
					"sameAs": [
						"https://github.com/GabrielFeijo",
						"https://www.linkedin.com/in/gabriel-feijo/"
					],
					"knowsAbout": [
						"React",
						"TypeScript",
						"Node.js",
						"JavaScript",
						"Full Stack Development",
						"Web Development",
						"Frontend Development",
						"Backend Development"
					]
				})}
			</script>

			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebSite",
					"name": siteTitle,
					"url": siteUrl,
					"description": siteDescription,
					"author": {
						"@type": "Person",
						"name": authorName
					},
					"inLanguage": "pt-BR"
				})}
			</script>
		</Helmet>
	);
};

export default MetadataComponent;