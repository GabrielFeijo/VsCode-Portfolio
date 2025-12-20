import { normalizeFileName } from '../../src/utils/normalizeFileName';

describe('normalizeFileName', () => {
    test('removes extension and lowercases', () => {
        expect(normalizeFileName('Arquivo.TXT')).toBe('arquivo');
    });

    test('removes accents and spaces to hyphens', () => {
        expect(normalizeFileName('Olá Mundo.html')).toBe('ola-mundo');
    });

    test('removes special characters', () => {
        expect(normalizeFileName('test@# $%^&gabriel.md')).toBe('test-gabriel');
    });

    test('handles empty string and dotfiles', () => {
        expect(normalizeFileName('')).toBe('');
        expect(normalizeFileName('.env')).toBe('');
    });

    test('trims and collapses spaces, removes underscores and other specials', () => {
        expect(normalizeFileName('  Hello   World__v2.txt ')).toBe('-hello-worldv2');
    });

    test('removes all diacritics and special punctuation', () => {
        expect(normalizeFileName('ÁÉÍÓÚ Ç ñ -- example!.md')).toBe('aeiou-c-n----example');
    });

    test('already normalized stays same', () => {
        expect(normalizeFileName('already-normal')).toBe('already-normal');
    });
});
