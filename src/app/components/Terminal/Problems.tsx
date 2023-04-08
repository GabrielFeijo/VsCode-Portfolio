import { Box, Typography } from '@mui/material';
import React from 'react';

const info = {
	'pt-BR': 'Não foi detectado nenhum problema no workspace.',
	en: 'No problems were detected in the workspace.',
};

interface Props {
	language: string;
}

const Problems = ({ language }: Props) => {
	return (
		<Box>
			<Typography sx={{ fontSize: '.8rem' }}>
				{info[language as keyof typeof info]}
			</Typography>
		</Box>
	);
};

export default Problems;
