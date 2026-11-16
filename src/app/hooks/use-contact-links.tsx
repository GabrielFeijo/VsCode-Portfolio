import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

export function useContactLinks() {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				index: 0,
				icon: <FaGithub />,
				title: t('contact.github.title'),
				href: t('contact.github.href'),
			},
			{
				index: 1,
				icon: <FaLinkedin />,
				title: t('contact.linkedin.title'),
				href: t('contact.linkedin.href'),
			},
			{
				index: 2,
				icon: <FaEnvelope />,
				title: t('contact.email.title'),
				href: t('contact.email.href'),
			},
		],
		[t],
	);
}
