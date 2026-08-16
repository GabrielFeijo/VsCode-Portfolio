import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscChromeClose, VscRecordKeys } from 'react-icons/vsc';
import styles from './KeyboardShortcutsModal.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInOut } from '../../../utils/motionVariants';
import { isMobile } from 'react-device-detect';
import { KEYBOARD_SHORTCUTS } from './keyboardShortcuts.config';
import Kbd from '../ui/Kbd';

interface Props {
	visible: boolean;
}

export default function KeyboardShortcutsModal({ visible }: Props) {
	const [show, setShow] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		if (!visible) {
			setShow(false);
			return;
		}

		let hideTimeout: ReturnType<typeof setTimeout> | undefined;
		const showTimeout = setTimeout(() => {
			setShow(true);
			hideTimeout = setTimeout(() => setShow(false), 5000);
		}, 2500);

		return () => {
			clearTimeout(showTimeout);
			if (hideTimeout) clearTimeout(hideTimeout);
		};
	}, [visible]);

	if (!show || isMobile) return null;

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
							<div className={styles.titleGroup}>
								<VscRecordKeys className={styles.titleIcon} />
								<h2 className={styles.title}>{t('shortcuts.title')}</h2>
							</div>
							<button
								className={styles.closeButton}
								onClick={() => setShow(false)}
								aria-label={t('shortcuts.close') || 'Close keyboard shortcuts modal'}
							>
								<VscChromeClose />
							</button>
						</div>

						<div className={styles.modalContent}>
							{KEYBOARD_SHORTCUTS.map((shortcut, index) => (
								<motion.div
									key={shortcut.id}
									className={styles.shortcutItem}
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<div className={styles.shortcutInfo}>
										<div
											className={styles.iconContainer}
											data-accent={shortcut.accent}
										>
											{shortcut.icon}
										</div>
										<span className={styles.shortcutLabel}>
											{t(shortcut.labelKey)}
										</span>
									</div>
									<Kbd keys={shortcut.keys} />
								</motion.div>
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
