import { Box, Stack, Typography } from '@mui/material';
import type React from 'react';
import {
	VscAdd,
	VscChevronDown,
	VscClose,
	VscEllipsis,
	VscSplitHorizontal,
	VscTerminalCmd,
	VscTrash,
} from 'react-icons/vsc';
import { useAppPalette } from '../theme/useAppPalette';

interface TerminalIconButtonProps {
	'aria-label': string;
	onClick?: () => void;
	hideOnCompact?: boolean;
	children: React.ReactNode;
}

function TerminalIconButton({
	'aria-label': ariaLabel,
	onClick,
	hideOnCompact = false,
	children,
}: TerminalIconButtonProps) {
	const colors = useAppPalette();

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.();
		}
	};

	return (
		<Box
			component='button'
			aria-label={ariaLabel}
			tabIndex={0}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			sx={{
				cursor: 'pointer',
				height: 33,
				'&:hover': {
					backgroundColor: colors.bgHover,
				},
				WebkitTapHighlightColor: 'rgba(0,0,0,0)',
				p: 1,
				border: 'none',
				background: 'transparent',
				display: hideOnCompact ? { xs: 'none', md: 'flex' } : 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 0.5,
			}}
		>
			{children}
		</Box>
	);
}

interface TerminalToolbarProps {
	onCloseTerminal: () => void;
}

export function TerminalToolbar({ onCloseTerminal }: TerminalToolbarProps) {
	return (
		<Stack
			direction='row'
			spacing={0}
			role='toolbar'
			aria-label='Terminal toolbar'
			sx={{ flexShrink: 0 }}
		>
			<TerminalIconButton aria-label='Open terminal command' hideOnCompact>
				<VscTerminalCmd />
				<Typography sx={{ fontSize: '.8rem' }}>cmd</Typography>
			</TerminalIconButton>

			<TerminalIconButton aria-label='Add new terminal' hideOnCompact>
				<VscAdd />
				<VscChevronDown />
			</TerminalIconButton>

			<TerminalIconButton aria-label='Split terminal' hideOnCompact>
				<VscSplitHorizontal />
			</TerminalIconButton>

			<TerminalIconButton aria-label='Delete terminal' hideOnCompact>
				<VscTrash />
			</TerminalIconButton>

			<TerminalIconButton aria-label='More options' hideOnCompact>
				<VscEllipsis />
			</TerminalIconButton>

			<TerminalIconButton aria-label='Close terminal' onClick={onCloseTerminal}>
				<VscClose />
			</TerminalIconButton>
		</Stack>
	);
}
