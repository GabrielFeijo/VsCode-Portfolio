import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  EditorProvider,
  initVisiblePageIndexes,
  loadPages,
  useEditorContext,
} from '../../src/contexts/EditorContext';
import { Page } from '../../src/domain/page';
import i18n from '../../src/i18n';
import { StorageService } from '../../src/services/storageService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('src/services/storageService', () => ({
  StorageService: {
    getData: jest.fn(() => []),
  },
}));

jest.mock('src/app/pages/pages', () => ({
  pageRoutes: {
    pt: [
      {
        index: 0,
        name: 'sobre-mim.html',
        route: 'sobre-mim',
        icon: null,
        content: '',
      },
    ],
    en: [
      {
        index: 0,
        name: 'about-me.html',
        route: 'about-me',
        icon: null,
        content: '',
      },
    ],
  },
}));

jest.mock('src/i18n', () => ({
  __esModule: true,
  default: {
    changeLanguage: jest.fn(),
    language: 'pt',
  },
}));

jest.mock('src/config/seo', () => ({
  getLocalizedPath: (path: string) => path,
  getLanguageFromPathname: () => 'pt',
}));

function TestConsumer() {
  const ctx = useEditorContext();
  return (
    <div>
      <span data-testid="selected">{ctx.selectedIndex}</span>
      <span data-testid="visible-indexes">
        {ctx.visiblePageIndexes.join(',')}
      </span>
      <span data-testid="visible-pages-count">{ctx.visiblePages.length}</span>
      <span data-testid="current-component">{ctx.currentComponent}</span>
      <span data-testid="page-0-content">
        {ctx.pages.find((p) => p.index === 0)?.content}
      </span>
      <span data-testid="pages-count">{ctx.pages.length}</span>
      <button
        onClick={() =>
          ctx.openTab({
            index: 0,
            name: 'test.html',
            route: 'test',
            icon: null,
            content: '',
          } as any)
        }
      >
        Open
      </button>
      <button
        onClick={() =>
          ctx.openTab({
            index: 1,
            name: 'other.html',
            route: 'other',
            content: '',
          })
        }
      >
        Open Other
      </button>
      <button onClick={() => ctx.closeTab(0)}>Close</button>
      <button onClick={() => ctx.closeTab(1)}>Close 1</button>
      <button onClick={() => ctx.closeAllTabs()}>Close All</button>
      <button onClick={() => ctx.openTabByTarget('.')}>Go Home</button>
      <button onClick={() => ctx.openTabByTarget('/')}>Target Root</button>
      <button onClick={() => ctx.openTabByTarget('home')}>Target Home</button>
      <button onClick={() => ctx.openTabByTarget('')}>Target Empty</button>
      <button onClick={() => ctx.openTabByTarget('sobre-mim.html')}>
        Target Valid
      </button>
      <button onClick={() => ctx.openTabByTarget('unknown.html')}>
        Target Invalid
      </button>
      <button
        onClick={() =>
          ctx.updatePageContent('sobre-mim.html', 'updated content')
        }
      >
        Update Content
      </button>
      <button
        onClick={() => ctx.updatePageContent('unknown.html', 'some content')}
      >
        Update NonExistent
      </button>
      <button onClick={() => ctx.closeOtherTabs(0)}>Close Others</button>
      <button onClick={() => ctx.closeTabsToRight(0)}>Close Right</button>
      <button onClick={() => ctx.closeTabsToLeft(1)}>Close Left</button>
      <button onClick={() => ctx.setCurrentComponent('MyComponent')}>
        Set Component
      </button>
      <button
        onClick={() =>
          ctx.setPages([
            { index: 0, name: 'sobre-mim.html', route: 'sobre-mim' },
            { index: 1, name: 'other.html', route: 'other' },
            { index: 2, name: 'extra.html', route: 'extra' },
          ])
        }
      >
        Set Multiple Pages
      </button>
      <button onClick={() => ctx.setVisiblePageIndexes([0, 1, 2])}>
        Set Visible Multiple
      </button>
      <button onClick={() => ctx.setSelectedIndex(2)}>Set Selected 2</button>
    </div>
  );
}

describe('EditorContext pure functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getData as jest.Mock).mockReturnValue([]);
  });

  test('loadPages(pt) returns merged pages', () => {
    const pages = loadPages('pt');
    expect(pages).toEqual([
      {
        index: 0,
        name: 'sobre-mim.html',
        route: 'sobre-mim',
        icon: null,
        content: '',
      },
    ]);
  });

  test('loadPages(en) returns merged pages', () => {
    const pages = loadPages('en');
    expect(pages).toEqual([
      {
        index: 0,
        name: 'about-me.html',
        route: 'about-me',
        icon: null,
        content: '',
      },
    ]);
  });

  test('loadPages merges default pages with stored data', () => {
    (StorageService.getData as jest.Mock).mockReturnValue([
      {
        index: 0,
        name: 'sobre-mim.html',
        route: 'sobre-mim',
        content: 'stored content',
      },
      {
        index: 99,
        name: 'custom.md',
        route: 'custom',
        content: 'custom content',
      },
    ]);

    const pages = loadPages('pt');
    expect(pages).toHaveLength(2);
    expect(pages[0]).toEqual({
      index: 0,
      name: 'sobre-mim.html',
      route: 'sobre-mim',
      icon: null,
      content: 'stored content',
    });
    expect(pages[1]).toEqual({
      index: 99,
      name: 'custom.md',
      route: 'custom',
      content: 'custom content',
    });
  });

  test('initVisiblePageIndexes(pages) returns all indexes', () => {
    const samplePages: Page[] = [
      { index: 0, name: 'a.html', route: 'a' },
      { index: 1, name: 'b.html', route: 'b' },
      { index: 2, name: 'c.html', route: 'c' },
    ];
    expect(initVisiblePageIndexes(samplePages)).toEqual([0, 1, 2]);
    expect(initVisiblePageIndexes([])).toEqual([]);
  });
});

describe('EditorProvider and useEditorContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getData as jest.Mock).mockReturnValue([]);
    i18n.language = 'pt';
  });

  test('useEditorContext throws without provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useEditorContext must be used within an EditorProvider',
    );
    consoleSpy.mockRestore();
  });

  test('openTab adds to visiblePageIndexes and sets selectedIndex', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const openButton = screen.getByText('Open');
    fireEvent.click(openButton);

    expect(screen.getByTestId('selected')).toHaveTextContent('0');
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0');
    expect(mockNavigate).toHaveBeenCalledWith('/test');
  });

  test('openTab with a new tab appends to visiblePageIndexes and navigates', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const openOtherButton = screen.getByText('Open Other');
    fireEvent.click(openOtherButton);

    expect(screen.getByTestId('selected')).toHaveTextContent('1');
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0,1');
    expect(mockNavigate).toHaveBeenCalledWith('/other');
  });

  test('closeTab removes from visiblePageIndexes', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('');
    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('closeAllTabs empties visiblePageIndexes and resets selectedIndex to -1', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const closeAllButton = screen.getByText('Close All');
    fireEvent.click(closeAllButton);

    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('');
    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('openTabByTarget(.) navigates to /', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const goHomeButton = screen.getByText('Go Home');
    fireEvent.click(goHomeButton);

    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('openTabByTarget with /, home, and empty string navigates to /', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Target Root'));
    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByText('Target Home'));
    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByText('Target Empty'));
    expect(screen.getByTestId('selected')).toHaveTextContent('-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('openTabByTarget with valid target opens matching page', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Target Valid'));

    expect(screen.getByTestId('selected')).toHaveTextContent('0');
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0');
    expect(mockNavigate).toHaveBeenCalledWith('/sobre-mim');
  });

  test('openTabByTarget with unknown target does nothing', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    mockNavigate.mockClear();
    fireEvent.click(screen.getByText('Target Invalid'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('updatePageContent updates the page content in state', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const updateButton = screen.getByText('Update Content');
    fireEvent.click(updateButton);

    expect(screen.getByTestId('page-0-content')).toHaveTextContent(
      'updated content',
    );
  });

  test('updatePageContent with non-existent fileName does not alter state', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    const updateUnknownButton = screen.getByText('Update NonExistent');
    fireEvent.click(updateUnknownButton);

    expect(screen.getByTestId('page-0-content')).toHaveTextContent('');
  });

  test('closeOtherTabs keeps only target tab open and navigates to it', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Open Other'));
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0,1');

    fireEvent.click(screen.getByText('Close Others'));

    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0');
    expect(screen.getByTestId('selected')).toHaveTextContent('0');
    expect(mockNavigate).toHaveBeenCalledWith('/sobre-mim');
  });

  test('closeTabsToRight slices visiblePageIndexes up to index', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Set Multiple Pages'));
    fireEvent.click(screen.getByText('Set Visible Multiple'));
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0,1,2');

    fireEvent.click(screen.getByText('Close Right'));
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0');
  });

  test('closeTabsToLeft slices visiblePageIndexes starting from index', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Set Multiple Pages'));
    fireEvent.click(screen.getByText('Set Visible Multiple'));
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0,1,2');

    fireEvent.click(screen.getByText('Close Left'));
    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('1,2');
  });

  test('updates selectedIndex to minIndex when selected tab is removed and selectedIndex is less than min', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Set Multiple Pages'));
    fireEvent.click(screen.getByText('Set Visible Multiple'));
    fireEvent.click(screen.getByText('Open'));

    fireEvent.click(screen.getByText('Close Left'));

    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('1,2');
    expect(screen.getByTestId('selected')).toHaveTextContent('1');
  });

  test('updates selectedIndex to maxIndex when selected tab is removed and selectedIndex is greater than max', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Set Multiple Pages'));
    fireEvent.click(screen.getByText('Set Visible Multiple'));
    fireEvent.click(screen.getByText('Set Selected 2'));

    fireEvent.click(screen.getByText('Close Right'));

    expect(screen.getByTestId('visible-indexes')).toHaveTextContent('0');
    expect(screen.getByTestId('selected')).toHaveTextContent('0');
  });

  test('setCurrentComponent updates currentComponent in state', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText('Set Component'));
    expect(screen.getByTestId('current-component')).toHaveTextContent(
      'MyComponent',
    );
  });

  test('changes language in i18n when language prop changes', () => {
    const { rerender } = render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    i18n.language = 'pt';

    rerender(
      <EditorProvider language="en">
        <TestConsumer />
      </EditorProvider>,
    );

    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
  });

  test('listens to storage event and reloads pages', () => {
    render(
      <EditorProvider language="pt">
        <TestConsumer />
      </EditorProvider>,
    );

    (StorageService.getData as jest.Mock).mockReturnValue([
      {
        index: 0,
        name: 'sobre-mim.html',
        route: 'sobre-mim',
        content: 'from-storage',
      },
    ]);

    act(() => {
      window.dispatchEvent(new Event('storage'));
    });

    expect(screen.getByTestId('page-0-content')).toHaveTextContent(
      'from-storage',
    );
  });
});
