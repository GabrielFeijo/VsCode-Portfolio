import styles from './kbd.module.css';

interface KbdProps {
	keys: readonly string[];
}

export default function Kbd({ keys }: KbdProps) {
	return (
		<fieldset className={styles.kbdGroup} aria-label={keys.join(' + ')}>
			{keys.map((key) => (
				<span key={key} className={styles.kbd}>
					{key}
				</span>
			))}
		</fieldset>
	);
}
