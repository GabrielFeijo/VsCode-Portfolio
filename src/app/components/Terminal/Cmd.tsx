import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../domain/page';
import { fonts } from '../../theme/typography';
import styles from './Cmd.module.css';
import TerminalLine from './terminal/TerminalLine';
import TerminalPrompt from './terminal/TerminalPrompt';
import { useTheme } from '../../../contexts/ThemeContext';
import { getTerminalColors } from './terminal/terminalConfig';
import { useTerminal } from './terminal/useTerminal';

interface Props {
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
	language: Language;
}

const Cmd = ({ setRanking, changeLanguage, language }: Props) => {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const colors = getTerminalColors(theme);
	const {
		cwd,
		entries,
		command,
		setCommand,
		isDark,
		inputRef,
		scrollRef,
		handleKeyDown,
		submitCommand,
		getCompletions,
	} = useTerminal({ language, setRanking, changeLanguage });

	const completions = getCompletions(command.trim());
	const ghostText =
		completions.length === 1 && completions[0].startsWith(command.trim()) && command.trim()
			? completions[0].slice(command.trim().length)
			: '';

	const isEnterKeyPressed = (e: React.ChangeEvent<HTMLTextAreaElement>): boolean => {
		const inputEvent = e.nativeEvent as InputEvent;
		return (
			inputEvent.inputType === 'insertLineBreak' ||
			(inputEvent.inputType === 'insertText' && inputEvent.data === null)
		);
	};

	const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!isEnterKeyPressed(e)) {
			setCommand(e.target.value);
			return;
		}
		await submitCommand();
	};

	return (
		<Box
			id="cmd-terminal"
			className={styles.terminal}
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: fonts.mono,
				color: colors.text,
				backgroundColor: colors.bg,
				borderRadius: '4px',
				overflow: 'hidden',
			}}
		>
			<Box className={styles.welcome} sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
				<TerminalLine
					lines={[
						`\x1b[96m╭─\x1b[0m \x1b[1;92mOh My Portfolio!\x1b[0m \x1b[90m— zsh 5.9\x1b[0m`,
						`\x1b[96m╰─\x1b[0m \x1b[90m${t('terminal.info.welcome')}\x1b[0m`,
					]}
				/>
			</Box>

			<Box
				ref={scrollRef}
				className={styles.output}
				sx={{
					flex: 1,
					overflow: 'auto',
					px: 1.5,
					py: 0.5,
				}}
			>
				{entries.map((entry) => (
					<Box key={entry.id} sx={{ mb: 1 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'flex-start',
								flexWrap: 'wrap',
								gap: 0.5,
							}}
						>
							<TerminalPrompt cwd={entry.cwd} isDark={isDark} />
							<Box
								component="span"
								sx={{
									fontFamily: 'inherit',
									fontSize: '0.85rem',
									wordBreak: 'break-all',
								}}
							>
								{entry.command}
							</Box>
						</Box>
						{entry.response.length > 0 && (
							<TerminalLine lines={entry.response} color={entry.color} />
						)}
					</Box>
				))}

				<Box
					className={styles.inputRow}
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
						flexWrap: 'nowrap',
						position: 'relative',
						minHeight: '1.6em',
					}}
				>
					<TerminalPrompt cwd={cwd} isDark={isDark} />
					<Box className={styles.inputWrapper}>
						{ghostText && (
							<Box className={styles.ghost} aria-hidden="true">
								<span className={styles.invisible}>{command}</span>
								<span className={styles.ghostText}>{ghostText}</span>
							</Box>
						)}
						<textarea
							ref={inputRef}
							placeholder={t('terminal.info.placeholder')}
							className={styles.input}
							rows={1}
							spellCheck={false}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							aria-label={t('terminal.info.placeholder') || 'Terminal command input'}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							value={command}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default Cmd;
