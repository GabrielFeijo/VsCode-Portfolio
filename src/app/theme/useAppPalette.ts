import { useTheme as useMuiTheme } from '@mui/material/styles';
import { type AppPaletteColors, getAppPalette } from './palette';

export function useAppPalette(): AppPaletteColors {
	const mode = useMuiTheme().palette.mode;
	return getAppPalette(mode === 'dark' ? 'dark' : 'light');
}
