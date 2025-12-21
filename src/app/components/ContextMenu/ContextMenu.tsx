import { useEffect, useRef } from 'react';
import { VscGithub, VscTrash } from 'react-icons/vsc';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ContextMenu.module.css';
import { MdOpenInNew } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

interface ContextMenuPosition {
	mouseX: number;
	mouseY: number;
}

interface Props {
	contextMenu: ContextMenuPosition | null;
	handleOpenFile: () => void;
	handleOpenFileOnGithub: () => void;
	handleClose: () => void;
	handleDelete: () => void;
}

export default function ContextMenu({
	contextMenu,
	handleOpenFile,
	handleOpenFileOnGithub,
	handleClose,
	handleDelete,
}: Props) {
	const menuRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				handleClose();
			}
		};

		if (contextMenu !== null) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [contextMenu, handleClose]);

	if (contextMenu === null) return null;

	return (
		<AnimatePresence>
			<motion.div
				className={styles.contextMenuWrapper}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
				<motion.div
					ref={menuRef}
					className={styles.contextMenu}
					style={{
						top: contextMenu.mouseY,
						left: contextMenu.mouseX,
					}}
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					transition={{ duration: 0.1 }}
				>
					<div className={styles.menuItems} role="menu">
						<button
							className={styles.menuItem}
							onClick={handleOpenFile}
							aria-label={t('contextMenu.open') || 'Open file'}
							role="menuitem"
						>
							<div className={styles.iconContainer}>
								<MdOpenInNew className={styles.icon} />
							</div>
							<span className={styles.menuText}>{t('contextMenu.open')}</span>
						</button>
						<button
							className={styles.menuItem}
							onClick={handleDelete}
							aria-label={t('contextMenu.delete') || 'Delete file'}
							role="menuitem"
						>
							<div className={styles.iconContainer}>
								<VscTrash className={styles.icon} />
							</div>
							<span className={styles.menuText}>{t('contextMenu.delete')}</span>
						</button>
						<button
							className={styles.menuItem}
							onClick={handleOpenFileOnGithub}
							aria-label={t('contextMenu.openOnGithub') || 'Open file on GitHub'}
							role="menuitem"
						>
							<div className={styles.iconContainer}>
								<VscGithub className={styles.icon} />
							</div>
							<span className={styles.menuText}>
								{t('contextMenu.openOnGithub')}
							</span>
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
