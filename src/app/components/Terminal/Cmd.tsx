import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import styles from './Cmd.module.css';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../axios/config';

interface Props {
	language: string;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
	setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const info = {
	'pt-BR': {
		version: 'Versão',
		allRightsReserved: 'Todos os direitos reservados',
		placeholder: 'Digite um comando (ajuda para ver todos os comandos)',
		error:
			'Desculpe, não foi possível concluir sua solicitação. O comando que você inseriu não foi reconhecido pelo sistema. Por favor, verifique se o comando está correto e tente novamente. Se precisar de ajuda, digite "help" para obter uma lista de comandos disponíveis.',
		theme: 'Tema alterado com sucesso!',
		language: 'Idioma alterado com sucesso!',
		feedback: 'Opinião',
	},
	en: {
		version: 'Version',
		allRightsReserved: 'All rights reserved.',
		placeholder: 'Type a command (help to see all commands)',
		error:
			"Sorry, we couldn't complete your request. The command you entered was not recognized by the system. Please check if the command is correct and try again. If you need help, type 'help' to get a list of available commands.",
		theme: 'Theme successfully updated!',
		language: 'Language changed successfully!',
		feedback: 'Feedback',
	},
};

const labelsPT: { [index: string]: string } = {
	0.5: 'Inútil',
	1: 'Inútil+',
	1.5: 'Ruim',
	2: 'Ruim+',
	2.5: 'Ok',
	3: 'Ok+',
	3.5: 'Bom',
	4: 'Bom+',
	4.5: 'Excelente',
	5: 'Excelente+',
};
const labelsEN: { [index: string]: string } = {
	0.5: 'Useless',
	1: 'Useless+',
	1.5: 'Poor',
	2: 'Poor+',
	2.5: 'Ok',
	3: 'Ok+',
	3.5: 'Good',
	4: 'Good+',
	4.5: 'Excellent',
	5: 'Excellent+',
};

const Cmd = ({ language, setRanking, setDarkMode, setLanguage }: Props) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [command, setCommand] = useState('');
	const [results, setResults]: any = useState([]);
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
						const request = await apiFetch.get('/api/reviews');
						const data = request.data;
						console.log(data);
						data.forEach((rate: any) => {
							const created: Date = new Date(rate['created_at']);
							const date = created.toLocaleString();
							response.push(
								`${date.replace(/,/g, ' ')} - [${rate.username}] ${
									rate.comment
								} ${info[language as keyof typeof info].feedback}: ${
									rate.stars
								} - ${
									language === 'pt-BR'
										? labelsPT[rate.stars]
										: labelsEN[rate.stars]
								}`
							);
						});

						result(response, color);
						break;
					case 'evaluate':
					case 'avaliar':
						setRanking(true);
						result(response, color);
						break;
					case 'changetheme':
					case 'mudartema':
						setDarkMode(theme.palette.mode === 'dark' ? false : true);
						response.push(info[language as keyof typeof info].theme);
						result(response, color);
						break;
					case 'changelanguage':
					case 'mudaridioma':
						setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR');
						response.push(info[language as keyof typeof info].language);
						result(response, color);
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
								result(response, color);
								break;
							default:
								const request = await apiFetch.get('/api/command', {
									params: {
										command: command,
									},
								});
								if (request.data !== '') {
									response = request.data.response;
								} else {
									response.push(info[language as keyof typeof info].error);
									color = '#ed4337';
								}
								result(response, color);
						}
				}

				return;
			}
		}
		setCommand(e.target.value);
	};

	const result = (response: [string], color: string) => {
		setResults([
			...results,
			{ command: command, response: response, color: color },
		]);
	};
	return (
		<Box id='teste'>
			<Box>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					GG Console [{info[language as keyof typeof info].version}{' '}
					1.0.0.19045.2728]
				</Typography>
				<Typography sx={{ fontSize: '.9rem', fontWeight: 'bold' }}>
					(c) Feijó Corporation.{' '}
					{info[language as keyof typeof info].allRightsReserved}
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
						placeholder={info[language as keyof typeof info].placeholder}
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
