import { Helmet } from 'react-helmet-async';

const MetadataComponent = () => {
	return (
		<Helmet>
			<meta
				name='theme-color'
				content='#000000'
			/>
			<meta
				name='keywords'
				content='Gabriel Feijó, desenvolvedor full stack, programador web, front-end, back-end, React, TypeScript, Next.js, Nest.js, JavaScript, Node.js, PostgreSQL, MySQL, MongoDB, banco de dados, API RESTful, desenvolvimento web, portfolio de programador, tecnologia, programação, UI/UX, responsivo, Recife, Brasil, desenvolvedor React, desenvolvedor TypeScript, desenvolvimento de software, engenharia de software, projetos web, freelancer, serviços de desenvolvimento, otimização de sites, aplicações web modernas, sistemas web, aplicações responsivas, desenvolvedor, programador fullstack, desenvolvedor javascript, portfólio profissional'
			/>
			<meta
				name='author'
				content='Gabriel Feijó'
			/>
			<meta
				property='description'
				content='Gabriel Feijó é um desenvolvedor Full Stack de Recife, apaixonado por tecnologia e criação de soluções web modernas. Conheça mais sobre sua trajetória e formação.'
			/>
			<meta
				property='og:title'
				content='Gabriel Feijó | Desenvolvedor Full Stack'
			/>
			<meta
				property='og:description'
				content='Gabriel Feijó é um desenvolvedor Full Stack de Recife, apaixonado por tecnologia e criação de soluções web modernas. Conheça mais sobre sua trajetória e formação.'
			/>
			<meta
				property='og:image'
				content='https://www.gabrielfeijo.com.br/gg.png'
			/>
			<meta
				property='og:url'
				content='https://www.gabrielfeijo.com.br'
			/>
			<meta
				property='og:type'
				content='website'
			/>

			<meta
				name='twitter:card'
				content='summary_large_image'
			/>
			<meta
				name='twitter:title'
				content='Gabriel Feijó | Desenvolvedor Full Stack'
			/>
			<meta
				name='twitter:description'
				content='Gabriel Feijó é um desenvolvedor Full Stack de Recife, apaixonado por tecnologia e criação de soluções web modernas. Conheça mais sobre sua trajetória e formação.'
			/>
			<meta
				name='twitter:image'
				content='https://www.gabrielfeijo.com.br/gg.png'
			/>
		</Helmet>
	);
};

export default MetadataComponent;
