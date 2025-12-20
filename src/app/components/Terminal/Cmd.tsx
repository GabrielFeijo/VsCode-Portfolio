import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import styles from './Cmd.module.css';
import { useNavigate } from 'react-router-dom';
import {
	IRate,
	ReviewService,
} from '../../../services/api/review/ReviewService';
import { CommandService } from '../../../services/api/command/CommandService';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface Props {
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

const Cmd = ({ setRanking, changeLanguage }: Props) => {
	const { t } = useTranslation();
	const { toggleTheme } = useTheme();
	const navigate = useNavigate();
	const [command, setCommand] = useState('');
	const [results, setResults] = useState<
		{
			command: string;
			response: [string];
			color: string;
		}[]
	>([]);

	const saveResult = (response: [string], color: string = '') => {
		setResults((prevState) => [...prevState, { command, response, color }]);
	};

	const isEnterKeyPressed = (e: React.ChangeEvent<HTMLTextAreaElement>): boolean => {
		const inputEvent = e.nativeEvent as InputEvent;
		return (
			inputEvent.inputType === 'insertLineBreak' ||
			(inputEvent.inputType === 'insertText' && inputEvent.data === null)
		);
	};

	const formatReviewResponse = (rates: IRate[]): string[] => {
		return rates.map((rate) => {
			const date = dayjs(rate.createdAt).format('DD/MM/YYYY HH:mm:ss');
			return `${date} - [${rate.username}] ${rate.comment} ${t('terminal.info.feedback')}: ${rate.stars} - ${t(`terminal.rating.${String(rate.stars)}`)}`;
		});
	};

	const handleReviewsCommand = async (): Promise<void> => {
		const responseData = await ReviewService.findAll();

		if (responseData instanceof Error) {
			console.error(responseData.message);
			return;
		}

		const response = ['', ...formatReviewResponse(responseData)] as [string];
		saveResult(response);
	};

	const handleEvaluateCommand = (): void => {
		setRanking(true);
		saveResult(['']);
	};

	const handleChangeThemeCommand = (): void => {
		toggleTheme();
		saveResult([t('terminal.info.theme')]);
	};

	const handleChangeLanguageCommand = (): void => {
		changeLanguage();
		saveResult([t('terminal.info.language')]);
	};

	const handleClearCommand = (): void => {
		setResults([]);
	};

	const handleRouteCommand = (route: string): void => {
		navigate(`/${route}`);
		saveResult(['']);
	};

	const handleDefaultCommand = async (): Promise<void> => {
		const responseData = await CommandService.getResponse(command);

		if (responseData instanceof Error) {
			console.error(responseData.message);
			saveResult([t('terminal.info.error')], '#ed4337');
			return;
		}

		saveResult(responseData.response);
	};

	const executeCommand = async (): Promise<void> => {
		const lowerCommand = command.toLowerCase();

		const commandMap: Record<string, () => void | Promise<void>> = {
			'reviews': handleReviewsCommand,
			'avaliacoes': handleReviewsCommand,
			'evaluate': handleEvaluateCommand,
			'avaliar': handleEvaluateCommand,
			'changetheme': handleChangeThemeCommand,
			'mudartema': handleChangeThemeCommand,
			'changelanguage': handleChangeLanguageCommand,
			'mudaridioma': handleChangeLanguageCommand,
			'clear': handleClearCommand,
			'limpar': handleClearCommand,
		};

		const handler = commandMap[lowerCommand];
		if (handler) {
			await handler();
			return;
		}

		const spaceIndex = command.indexOf(' ');
		if (spaceIndex > 0) {
			const cmd = command.substring(0, spaceIndex).toLowerCase();
			const arg = command.substring(spaceIndex + 1);

			if (cmd === 'route' || cmd === 'rota') {
				handleRouteCommand(arg);
				return;
			}
		}

		await handleDefaultCommand();
	};

	const verifyCommand = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!isEnterKeyPressed(e)) {
			setCommand(e.target.value);
			return;
		}

		if (command.length <= 1) {
			return;
		}

		setCommand('');
		await executeCommand();
	};

	return (
		<Box id='cmd-terminal'>
			<Box>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					GG Console [{t('terminal.info.version')} 1.0.0.19045.2728]
				</Typography>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					(c) Feijó Corporation. {t('terminal.info.allRightsReserved')}
				</Typography>
			</Box>
			<Box sx={{ wordBreak: 'break-word', mt: 1 }}>
				{results.length > 0 ? (
					results.map((resultado: any, index: number) => (
						<Box key={index}>
							<Typography>
								D:\GG\Desktop\workspace\React\react-vscode{'>'}{' '}
								{resultado.command}
							</Typography>
							<Box
								style={resultado.color !== '' ? { color: resultado.color } : {}}
							>
								{resultado.response.length > 0 &&
									resultado.response.map((res: [string], index: number) => (
										<Typography key={index}>{res}</Typography>
									))}
								<br />
							</Box>
						</Box>
					))
				) : (
					<></>
				)}
				<Box
					display={'flex'}
					alignItems={'center'}
					flexWrap={'wrap'}
					gap={1}
				>
					<Typography>
						D:\GG\Desktop\workspace\React\react-vscode{'>'}
					</Typography>
					<textarea
						placeholder={t('terminal.info.placeholder')}
						className={styles.text}
						rows={1}
						aria-label={t('terminal.info.placeholder') || 'Terminal command input'}
						style={{
							outline: 0,
							border: 0,
							paddingLeft: 1.2,
							backgroundColor: 'transparent',
							resize: 'none',
							fontSize: '.9rem',
						}}
						onChange={(e) => verifyCommand(e)}
						value={command}
					></textarea>
				</Box>
			</Box>
		</Box>
	);
};

export default Cmd;
