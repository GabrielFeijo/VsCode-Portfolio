import styles from './Kbd.module.css';

interface Props {
	keys: string[];
}

export default function Kbd({ keys }: Props) {
	return (
		<div className={styles.kbdGroup} role="group" aria-label={keys.join(' + ')}>
			{keys.map((key, index) => (
				<span key={`${key}-${index}`} className={styles.kbd}>
					{key}
				</span>
			))}
		</div>
	);
}
