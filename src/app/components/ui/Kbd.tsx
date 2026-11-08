import styles from './Kbd.module.css';

interface Props {
	keys: readonly string[];
}

export default function Kbd({ keys }: Props) {
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
