import {
	getCompletionState,
	getCompletions,
} from '../../../src/app/components/Terminal/terminal/utils/autocomplete';
import { VirtualDirectory } from '../../../src/app/components/Terminal/terminal/types';

describe('autocomplete', () => {
	const allCommands = ['help', 'history', 'cat', 'cd', 'ls', 'echo', 'projects'];
	const mockFs: VirtualDirectory = {
		'/home/gabriel': [
			{ name: 'vscode-portfolio', type: 'dir' },
			{ name: 'readme.md', type: 'file' },
		],
	};

	it('returns empty result for empty input', () => {
		expect(getCompletionState('', '/home/gabriel', allCommands, mockFs)).toEqual({
			value: null,
			candidates: [],
			list: [],
			isPath: false,
		});
		expect(getCompletions('', '/home/gabriel', allCommands, mockFs)).toEqual([]);
	});

	it('completes unique command with trailing space', () => {
		const state = getCompletionState('proj', '/home/gabriel', allCommands, mockFs);
		expect(state.value).toBe('projects ');
		expect(state.candidates).toEqual(['projects']);
	});

	it('returns multiple candidates without completion value when ambiguous', () => {
		const state = getCompletionState('h', '/home/gabriel', allCommands, mockFs);
		expect(state.value).toBeNull();
		expect(state.candidates).toEqual(['help', 'history']);
	});

	it('completes path arguments for path commands', () => {
		const state = getCompletionState('cd read', '/home/gabriel', allCommands, mockFs);
		expect(state.isPath).toBe(true);
		expect(state.value).toBe('cd readme.md ');
		expect(state.candidates).toEqual(['cd readme.md']);
	});

	it('completes directory path arguments without trailing space but with slash', () => {
		const state = getCompletionState('cd vsc', '/home/gabriel', allCommands, mockFs);
		expect(state.value).toBe('cd vscode-portfolio/');
	});

	it('returns empty candidates when path does not match', () => {
		const state = getCompletionState('cd nonexistent', '/home/gabriel', allCommands, mockFs);
		expect(state.candidates).toEqual([]);
		expect(state.value).toBeNull();
	});
});
