'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	VscTerminal,
	VscColorMode,
	VscHome,
	VscGlobe,
	VscChromeClose,
	VscEditorLayout
} from 'react-icons/vsc';
import styles from './KeyboardShortcutsModal.module.css';

interface Props {
	visible: boolean;
}

export default function KeyboardShortcutsModal({ visible }: Props) {
	const [show, setShow] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		if (visible) {
			const timeout = setTimeout(() => {
				setShow(true);
				const hideTimeout = setTimeout(() => setShow(false), 5000);
				return () => clearTimeout(hideTimeout);
			}, 2500);
			return () => clearTimeout(timeout);
		}
	}, [visible]);

	if (!show) return null;

	const shortcuts = [
		{
			icon: <VscTerminal className={styles.icon} />,
			key: 'Ctrl + J',
			label: t('shortcuts.terminal'),
		},
		{
			icon: <VscColorMode className={styles.icon} />,
			key: 'Ctrl + D',
			label: t('shortcuts.theme'),
		},
		{
			icon: <VscGlobe className={styles.icon} />,
			key: 'Ctrl + L',
			label: t('shortcuts.language'),
		},
		{
			icon: <VscEditorLayout className={styles.icon} />,
			key: 'Ctrl + B',
			label: t('shortcuts.sidebar'),
		},
		{
			icon: <VscHome className={styles.icon} />,
			key: 'Ctrl + H',
			label: t('shortcuts.home'),
		},
	];

	return (
		<div className={styles.modalContainer}>
			<div className={styles.modal}>
				<div className={styles.modalHeader}>
					<h3 className={styles.title}>{t('shortcuts.title')}</h3>
					<button
						className={styles.closeButton}
						onClick={() => setShow(false)}
						aria-label='Close'
					>
						<VscChromeClose />
					</button>
				</div>
				<div className={styles.modalContent}>
					{shortcuts.map((shortcut, index) => (
						<div
							key={index}
							className={styles.shortcutItem}
						>
							<div className={styles.shortcutInfo}>
								<div className={styles.iconContainer}>{shortcut.icon}</div>
								<span className={styles.shortcutLabel}>{shortcut.label}</span>
							</div>
							<div className={styles.keyBadge}>{shortcut.key}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
