import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { siteConfig } from '../../config/site';

export const contact = [
	{
		index: 0,
		title: 'Find me on Github',
		href: siteConfig.githubUrl,
		icon: <FaGithub />,
	},
	{
		index: 1,
		title: 'Find me on LinkedIn',
		href: 'https://www.linkedin.com/in/gabriel-feijo/',
		icon: <FaLinkedin />,
	},
	{
		index: 2,
		title: 'Contact me via email',
		href: 'mailto:feijo6622@gmail.com',
		icon: <FaEnvelope />,
	},
];

export const contato = [
	{
		index: 0,
		title: 'Encontre-me no Github',
		href: siteConfig.githubUrl,
		icon: <FaGithub />,
	},
	{
		index: 1,
		title: 'Encontre-me no LinkedIn',
		href: 'https://www.linkedin.com/in/gabriel-feijo/',
		icon: <FaLinkedin />,
	},
	{
		index: 2,
		title: 'Contate-me por e-mail',
		href: 'mailto:feijo6622@gmail.com',
		icon: <FaEnvelope />,
	},
];
