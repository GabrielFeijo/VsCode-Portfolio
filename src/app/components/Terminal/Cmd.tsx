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

	const verifyCommand = async (e: any) => {
		if (
			e.nativeEvent.inputType === 'insertLineBreak' ||
			(e.nativeEvent.inputType === 'insertText' && e.nativeEvent.data === null)
		) {
			if (command.length > 1) {
				let response: [string] = [''];
				let color = '';
				setCommand('');

				switch (command) {
					case 'reviews':
					case 'avaliacoes':
						const responseData = await ReviewService.findAll();

						if (responseData instanceof Error) {
							console.log(responseData.message);
						} else {
							responseData.forEach((rate: IRate) => {
								const created: Date = new Date(rate['created_at']);
								const date = created.toLocaleString();

								response.push(
									`${date.replace(/,/g, ' ')} - [${rate.username}] ${rate.comment
									} ${t('terminal.info.feedback')}: ${rate.stars} - 
									${t(`terminal.rating.${String(rate.stars)}`)}`
								);
							});

							saveResult(response, color);
						}

						break;
					case 'evaluate':
					case 'avaliar':
						setRanking(true);
						saveResult(response, color);
						break;
					case 'changetheme':
					case 'mudartema':
						toggleTheme();
						response.push(t('terminal.info.theme'));
						saveResult(response, color);
						break;
					case 'changelanguage':
					case 'mudaridioma':
						changeLanguage();
						response.push(t('terminal.info.language'));
						saveResult(response, color);
						break;
					case 'clear':
					case 'limpar':
						setResults([]);
						break;
					default:
						const cmd = command.substring(0, command.indexOf(' '));
						switch (cmd) {
							case 'route':
							case 'rota':
								const route = command.replace(`${cmd} `, '');
								navigate(`/${route}`);
								saveResult(response, color);
								break;
							default:
								const responseData = await CommandService.getResponse(command);

								if (responseData instanceof Error) {
									console.log(responseData.message);

									response.push(t('terminal.info.error'));
									color = '#ed4337';
								} else {
									response = responseData.response;
								}
								saveResult(response, color);
						}
				}

				return;
			}
		}
		setCommand(e.target.value);
	};

	const saveResult = (response: [string], color: string) => {
		setResults((prevState) => [...prevState, { command, response, color }]);
	};

	return (
		<Box id='teste'>
			<Box>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					GG Console [{t('terminal.info.version')}{' '}
					1.0.0.19045.2728]
				</Typography>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					(c) Feijó Corporation.{' '}
					{t('terminal.info.allRightsReserved')}
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
