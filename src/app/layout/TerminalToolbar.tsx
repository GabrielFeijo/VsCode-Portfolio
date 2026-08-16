import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
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
	children: React.ReactNode;
}

function TerminalIconButton({
	'aria-label': ariaLabel,
	onClick,
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
			component="button"
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
				display: 'flex',
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
			direction="row"
			spacing={0}
			role="toolbar"
			aria-label="Terminal toolbar"
		>
			<TerminalIconButton aria-label="Open terminal command">
				<VscTerminalCmd />
				<Typography sx={{ fontSize: '.8rem' }}>cmd</Typography>
			</TerminalIconButton>

			<TerminalIconButton aria-label="Add new terminal">
				<VscAdd />
				<VscChevronDown />
			</TerminalIconButton>

			<TerminalIconButton aria-label="Split terminal">
				<VscSplitHorizontal />
			</TerminalIconButton>

			<TerminalIconButton aria-label="Delete terminal">
				<VscTrash />
			</TerminalIconButton>

			<TerminalIconButton aria-label="More options">
				<VscEllipsis />
			</TerminalIconButton>

			<TerminalIconButton
				aria-label="Close terminal"
				onClick={onCloseTerminal}
			>
				<VscClose />
			</TerminalIconButton>
		</Stack>
	);
}
