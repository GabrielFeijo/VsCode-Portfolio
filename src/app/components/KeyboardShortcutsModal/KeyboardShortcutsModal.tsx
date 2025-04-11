'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	VscTerminal,
	VscColorMode,
	VscHome,
	VscGlobe,
	VscChromeClose,
	VscEditorLayout,
	VscSave,
} from 'react-icons/vsc';
import styles from './KeyboardShortcutsModal.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInOut } from '../../../utils/motionVariants';

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
		{
			icon: <VscSave className={styles.icon} />,
			key: 'Ctrl + S',
			label: t('shortcuts.save'),
		},
	];

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					className={styles.modalContainer}
					variants={fadeInOut}
					initial='initial'
					animate='animate'
					exit='exit'
				>
					<motion.div
						className={styles.modal}
						variants={{
							initial: { scale: 0.95, opacity: 0 },
							animate: { scale: 1, opacity: 1 },
							exit: { scale: 0.95, opacity: 0 },
						}}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
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
								<motion.div
									key={index}
									className={styles.shortcutItem}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<div className={styles.shortcutInfo}>
										<div className={styles.iconContainer}>{shortcut.icon}</div>
										<span className={styles.shortcutLabel}>
											{shortcut.label}
										</span>
									</div>
									<div className={styles.keyBadge}>{shortcut.key}</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
