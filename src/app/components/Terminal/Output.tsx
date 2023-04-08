import { Box, Typography } from '@mui/material';
import React from 'react';

interface Props {
	language: string;
}

const info = {
	'pt-BR': [
		{
			id: 1,
			message:
				'Às vezes sinto que passo mais tempo resolvendo bugs do que interagindo com pessoas.',
		},
		{
			id: 2,
			message:
				'Sou como o Batman, mas ao invés de lutar contra o crime, luto contra erros de sintaxe.',
		},
		{
			id: 3,
			message:
				'Não sou um mago da tecnologia, mas já fiz um programa imprimir "Hello World" sem nenhum erro!',
		},
		{
			id: 4,
			message:
				'Trabalhar com tecnologia é como brincar de Lego: construir coisas incríveis a partir de pequenas peças.',
		},
		{
			id: 5,
			message:
				'Acho que fui programado para gostar a tecnologia desde o berço!',
		},
		{
			id: 6,
			message: 'Os bugs não são defeitos, são recursos não documentados',
		},
		{
			id: 7,
			message: 'Programar é fácil, exceto quando não é',
		},
		{
			id: 8,
			message: 'Não se preocupe se não funciona direito na primeira tentativa',
		},
		{
			id: 9,
			message:
				'O programador ideal é aquele que olha duas vezes para atravessar uma rua de sentido único',
		},
		{
			id: 10,
			message:
				'Código bom é aquele que funciona. Código ruim é aquele que ainda funciona, mas você não sabe como',
		},
		{
			id: 11,
			message:
				'Quando você acha que encontrou a resposta para todas as perguntas, a vida muda as perguntas',
		},
	],
	en: [
		{
			id: 1,
			message:
				'Sometimes I feel like I spend more time fixing bugs than interacting with people.',
		},
		{
			id: 2,
			message:
				"I'm like Batman, but instead of fighting crime, I fight syntax errors.",
		},
		{
			id: 3,
			message:
				"I'm not a tech wizard, but I once made a program print 'Hello World' without any errors!",
		},
		{
			id: 4,
			message:
				'Working with technology is like playing with Lego: building amazing things from small pieces.',
		},
		{
			id: 5,
			message: 'I think I was programmed to love technology since birth!',
		},
		{
			id: 6,
			message: 'Bugs are not defects, they are undocumented features',
		},
		{
			id: 7,
			message: "Programming is easy, except when it's not",
		},
		{
			id: 8,
			message: "Don't worry if it doesn't work right the first time",
		},
		{
			id: 9,
			message:
				'The ideal programmer is the one who looks both ways before crossing a one-way street',
		},
		{
			id: 10,
			message:
				"Good code is code that works. Bad code is code that still works, but you don't know how.",
		},
		{
			id: 11,
			message:
				'When you think you have found the answer to all the questions, life changes the questions.',
		},
	],
};

const Output = ({ language }: Props) => {
	const timeElapsed = Date.now();
	let today = new Date(timeElapsed).toISOString();
	return (
		<Box>
			{info[language as keyof typeof info].map(({ id, message }) => (
				<Box
					key={id}
					display='flex'
					alignItems='center'
					gap={1}
				>
					<Typography sx={{ fontSize: '.8rem', color: '#5e6c9e' }}>
						{today.replace(/T|Z/g, ' ')}
					</Typography>
					<Typography sx={{ fontSize: '.8rem', color: '#32d97b' }}>
						[info]
					</Typography>
					<Typography sx={{ fontSize: '.8rem' }}> {message}</Typography>
				</Box>
			))}
		</Box>
	);
};

export default Output;
