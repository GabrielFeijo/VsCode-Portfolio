import { useEffect, useRef } from 'react';
import { VscChromeClose, VscCloseAll } from 'react-icons/vsc';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TabContextMenu.module.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ContextMenuPosition {
    mouseX: number;
    mouseY: number;
}

interface Props {
    contextMenu: ContextMenuPosition | null;
    currentTabIndex: number;
    visiblePageIndexes: number[];
    handleClose: () => void;
    handleCloseTab: () => void;
    handleCloseOthers: () => void;
    handleCloseToRight: () => void;
    handleCloseToLeft: () => void;
    handleCloseAll: () => void;
}

export default function TabContextMenu({
    contextMenu,
    currentTabIndex,
    visiblePageIndexes,
    handleClose,
    handleCloseTab,
    handleCloseOthers,
    handleCloseToRight,
    handleCloseToLeft,
    handleCloseAll,
}: Props) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        if (contextMenu !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [contextMenu, handleClose]);

    if (contextMenu === null) return null;

    const currentIndexPosition = visiblePageIndexes.indexOf(currentTabIndex);
    const hasTabsToRight = currentIndexPosition < visiblePageIndexes.length - 1;
    const hasTabsToLeft = currentIndexPosition > 0;
    const hasOtherTabs = visiblePageIndexes.length > 1;

    const menuItems = [
        {
            icon: <VscChromeClose className={styles.icon} />,
            label: t('tabContextMenu.close') || 'Close',
            onClick: handleCloseTab,
            enabled: true,
        },
        {
            icon: <VscCloseAll className={styles.icon} />,
            label: t('tabContextMenu.closeOthers') || 'Close Others',
            onClick: handleCloseOthers,
            enabled: hasOtherTabs,
        },
        {
            icon: <MdChevronRight className={styles.icon} />,
            label: t('tabContextMenu.closeToRight') || 'Close to the Right',
            onClick: handleCloseToRight,
            enabled: hasTabsToRight,
        },
        {
            icon: <MdChevronLeft className={styles.icon} />,
            label: t('tabContextMenu.closeToLeft') || 'Close to the Left',
            onClick: handleCloseToLeft,
            enabled: hasTabsToLeft,
        },
        {
            icon: <VscCloseAll className={styles.icon} />,
            label: t('tabContextMenu.closeAll') || 'Close All',
            onClick: handleCloseAll,
            enabled: true,
        },
    ];

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
                    className={`${styles.contextMenu} ${isDarkMode ? styles.dark : ''}`}
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
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                className={`${styles.menuItem} ${!item.enabled ? styles.disabled : ''
                                    }`}
                                onClick={() => {
                                    if (item.enabled) {
                                        item.onClick();
                                        handleClose();
                                    }
                                }}
                                disabled={!item.enabled}
                                aria-label={item.label}
                                role="menuitem"
                            >
                                <div className={styles.iconContainer}>{item.icon}</div>
                                <span className={styles.menuText}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}