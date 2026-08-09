import { createTheme } from '@mui/material';
import { Theme } from '../../contexts/ThemeContext';

export function createAppTheme(paletteType: Theme) {
	return createTheme({
		palette: {
			mode: paletteType,
			background: {
				default: paletteType === 'light' ? '#FFFFFF' : '#282A36',
			},
		},
		components: {
			MuiDivider: {
				styleOverrides: {
					root: {
						borderColor: 'rgba(255, 255, 255, 0.12)',
					},
				},
			},
		},
	});
}
