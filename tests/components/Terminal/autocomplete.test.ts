import {
	getCompletionState,
	getCompletions,
} from '../../../src/app/components/Terminal/terminal/utils/autocomplete';
import { VirtualDirectory } from '../../../src/app/components/Terminal/terminal/types';

describe('autocomplete', () => {
	const allCommands = [
		'help',
		'history',
		'cat',
		'cd',
		'ls',
		'echo',
		'code',
		'nano',
		'vim',
		'vi',
		'route',
		'rota',
		'theme',
		'tema',
		'lang',
		'idioma',
		'man',
		'projects',
	];
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

	it('completes code and nano command arguments with paths', () => {
		const codeState = getCompletionState('code read', '/home/gabriel', allCommands, mockFs);
		expect(codeState.isPath).toBe(true);
		expect(codeState.value).toBe('code readme.md ');

		const nanoState = getCompletionState('nano vsc', '/home/gabriel', allCommands, mockFs);
		expect(nanoState.isPath).toBe(true);
		expect(nanoState.value).toBe('nano vscode-portfolio/');

		const vimState = getCompletionState('vim read', '/home/gabriel', allCommands, mockFs);
		expect(vimState.value).toBe('vim readme.md ');
	});

	it('completes route and rota arguments', () => {
		const state = getCompletionState('route ab', '/home/gabriel', allCommands, mockFs);
		expect(state.value).toBe('route about-me ');
		expect(state.candidates).toEqual(['route about-me']);

		const rotaState = getCompletionState('rota sk', '/home/gabriel', allCommands, mockFs);
		expect(rotaState.value).toBe('rota skills ');
	});

	it('completes theme and tema arguments', () => {
		const state = getCompletionState('theme da', '/home/gabriel', allCommands, mockFs);
		expect(state.value).toBe('theme dark ');

		const temaState = getCompletionState('tema lig', '/home/gabriel', allCommands, mockFs);
		expect(temaState.value).toBe('tema light ');
	});

	it('completes lang, idioma and man arguments', () => {
		const langState = getCompletionState('lang p', '/home/gabriel', allCommands, mockFs);
		expect(langState.value).toBe('lang pt ');

		const idiomaState = getCompletionState('idioma e', '/home/gabriel', allCommands, mockFs);
		expect(idiomaState.value).toBe('idioma en ');

		const manState = getCompletionState('man proj', '/home/gabriel', allCommands, mockFs);
		expect(manState.value).toBe('man projects ');
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
