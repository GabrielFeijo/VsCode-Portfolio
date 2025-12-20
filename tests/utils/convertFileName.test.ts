import { convertFileName } from '../../src/app/utils/convertFileName';

test('converts .html to .md', () => {
    expect(convertFileName('page.html')).toBe('page.md');
    expect(convertFileName('index.html')).toBe('index.md');
});

test('handles filenames without .html and with different cases', () => {
    expect(convertFileName('PAGE.HTML')).toBe('PAGE.HTML');
    expect(convertFileName('readme.md')).toBe('readme.md');
});

test('converts files with paths and multiple dots', () => {
    expect(convertFileName('path/to/my.page.html')).toBe('path/to/my.page.md');
    expect(convertFileName('another.folder/index.html')).toBe('another.folder/index.md');
});
