import { createTheme } from '@mui/material';
import { Theme } from '../../contexts/ThemeContext';
import { appPalette } from './palette';
import { fonts } from './typography';

export function createAppTheme(paletteType: Theme) {
	const colors = appPalette[paletteType];
	const isDark = paletteType === 'dark';

	return createTheme({
		palette: {
			mode: paletteType,
			primary: {
				main: colors.accent,
				light: colors.accentHover,
				dark: colors.blue,
				contrastText: isDark ? colors.crust : colors.textInverse,
			},
			secondary: {
				main: colors.accentMuted,
				light: colors.lavender,
				dark: colors.mauve,
				contrastText: isDark ? colors.crust : colors.textInverse,
			},
			error: {
				main: colors.error,
			},
			warning: {
				main: colors.warning,
			},
			info: {
				main: colors.info,
			},
			success: {
				main: colors.success,
			},
			background: {
				default: colors.bgPrimary,
				paper: colors.bgSecondary,
			},
			text: {
				primary: colors.textPrimary,
				secondary: colors.textSecondary,
				disabled: colors.textMuted,
			},
			divider: colors.divider,
		},
		typography: {
			fontFamily: fonts.ui,
			fontSize: 14,
		},
		shape: {
			borderRadius: 8,
		},
		components: {
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						backgroundColor: colors.bgPrimary,
						color: colors.textPrimary,
					},
				},
			},
			MuiDivider: {
				styleOverrides: {
					root: {
						borderColor: colors.divider,
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: 'none',
					},
				},
			},
			MuiTooltip: {
				styleOverrides: {
					tooltip: {
						backgroundColor: colors.bgElevated,
						color: colors.textPrimary,
						border: `1px solid ${colors.border}`,
						fontSize: '0.75rem',
					},
					arrow: {
						color: colors.bgElevated,
					},
				},
			},
		},
	});
}
