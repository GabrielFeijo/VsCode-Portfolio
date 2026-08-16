import i18n from '../i18n';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, Page } from '../domain/page';
import { pageRoutes } from '../app/pages/pages';
import { StorageService } from '../services/storageService';
import { getLocalizedPath } from '../config/seo';

export function loadPages(language: Language): Page[] {
  const defaultPages = pageRoutes[language];
  const storedPages = StorageService.getData();

  const mergedDefaults = defaultPages.map((defPage) => {
    const baseName = defPage.name.replace(/\.(html|md)$/, '');
    const stored = storedPages.find(
      (s) =>
        s.index === defPage.index ||
        s.name === defPage.name ||
        s.name === `${baseName}.md` ||
        s.name === `${baseName}.html` ||
        s.name === baseName ||
        s.route === defPage.route,
    );
    return stored
      ? { ...defPage, ...stored, index: defPage.index, route: defPage.route }
      : defPage;
  });

  const customStored = storedPages.filter(
    (s) =>
      !defaultPages.some(
        (d) =>
          d.index === s.index ||
          d.route === s.route ||
          d.name === s.name ||
          d.name.replace(/\.(html|md)$/, '') ===
            s.name.replace(/\.(html|md)$/, ''),
      ),
  );

  return [...mergedDefaults, ...customStored];
}

export function initVisiblePageIndexes(pages: Page[]): number[] {
  return pages.map(({ index }) => index);
}

export interface EditorContextValue {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  currentComponent: string;
  setCurrentComponent: React.Dispatch<React.SetStateAction<string>>;
  visiblePageIndexes: number[];
  setVisiblePageIndexes: React.Dispatch<React.SetStateAction<number[]>>;
  visiblePages: Page[];
  openTab: (page: Page) => void;
  closeTab: (index: number) => void;
  closeOtherTabs: (index: number) => void;
  closeTabsToRight: (index: number) => void;
  closeTabsToLeft: (index: number) => void;
  closeAllTabs: () => void;
  openTabByTarget: (target: string) => void;
  updatePageContent: (fileName: string, content: string) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return ctx;
}

interface EditorProviderProps {
  children: React.ReactNode;
  language: Language;
}

export function EditorProvider({ children, language }: EditorProviderProps) {
  const navigate = useNavigate();

  const [pages, setPages] = useState<Page[]>(() => loadPages(language));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentComponent, setCurrentComponent] = useState('');
  const [visiblePageIndexes, setVisiblePageIndexes] = useState<number[]>(() =>
    initVisiblePageIndexes(loadPages(language)),
  );

  useEffect(() => {
    setPages(loadPages(language));
    if (!i18n.language.toLowerCase().startsWith(language)) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    if (visiblePageIndexes.length === 0) {
      setSelectedIndex(-1);
      navigate(getLocalizedPath('/', language));
      return;
    }

    if (selectedIndex !== -1 && !visiblePageIndexes.includes(selectedIndex)) {
      const maxIndex = Math.max(...visiblePageIndexes);
      const minIndex = Math.min(...visiblePageIndexes);
      const newIndex = selectedIndex > maxIndex ? maxIndex : minIndex;
      setSelectedIndex(newIndex);
      const page = pages.find((x) => x.index === newIndex);
      if (page) navigate(getLocalizedPath(`/${page.route}`, language));
    }
  }, [language, navigate, pages, selectedIndex, visiblePageIndexes]);

  useEffect(() => {
    const handleStorage = () => setPages(loadPages(language));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [language]);

  const visiblePages = useMemo(
    () =>
      visiblePageIndexes
        .map((index) => pages.find((page) => page.index === index))
        .filter((page): page is Page => page !== undefined),
    [pages, visiblePageIndexes],
  );

  const openTab = useCallback(
    (page: Page) => {
      setVisiblePageIndexes((prev) =>
        prev.includes(page.index) ? prev : [...prev, page.index],
      );
      setSelectedIndex(page.index);
      navigate(getLocalizedPath(`/${page.route}`, language));
    },
    [language, navigate],
  );

  const closeTab = useCallback((index: number) => {
    setVisiblePageIndexes((prev) => prev.filter((x) => x !== index));
  }, []);

  const closeOtherTabs = useCallback(
    (index: number) => {
      setVisiblePageIndexes([index]);
      setSelectedIndex(index);
      const page = pages.find((x) => x.index === index);
      if (page) navigate(getLocalizedPath(`/${page.route}`, language));
    },
    [language, navigate, pages],
  );

  const closeTabsToRight = useCallback((index: number) => {
    setVisiblePageIndexes((prev) => {
      const pos = prev.indexOf(index);
      return prev.slice(0, pos + 1);
    });
  }, []);

  const closeTabsToLeft = useCallback((index: number) => {
    setVisiblePageIndexes((prev) => {
      const pos = prev.indexOf(index);
      return prev.slice(pos);
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setVisiblePageIndexes([]);
    setSelectedIndex(-1);
    navigate(getLocalizedPath('/', language));
  }, [language, navigate]);

  const openTabByTarget = useCallback(
    (target: string) => {
      if (!target || target === '.' || target === '/' || target === 'home') {
        setSelectedIndex(-1);
        navigate(getLocalizedPath('/', language));
        return;
      }

      const currentPages = loadPages(language);
      const base = target.replace(/\.(html|md)$/, '').replace(/^\//, '');
      const matched = currentPages.find(
        (p) =>
          p.name === target ||
          p.name === `${base}.md` ||
          p.name === `${base}.html` ||
          p.name === base ||
          p.route === base ||
          p.route === `/${base}`,
      );

      if (matched) {
        setVisiblePageIndexes((prev) =>
          prev.includes(matched.index) ? prev : [...prev, matched.index],
        );
        setSelectedIndex(matched.index);
        navigate(getLocalizedPath(`/${matched.route}`, language));
      }
    },
    [language, navigate],
  );

  const updatePageContent = useCallback(
    (fileName: string, content: string) => {
      setPages((prev) => {
        const baseName = fileName.replace(/\.(html|md)$/, '');
        const idx = prev.findIndex(
          (p) =>
            p.name === fileName ||
            p.name === baseName ||
            p.name === `${baseName}.md` ||
            p.name === `${baseName}.html` ||
            p.route === baseName,
        );
        if (idx < 0) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content, isSaved: true };
        return updated;
      });
    },
    [],
  );

  const value: EditorContextValue = {
    pages,
    setPages,
    selectedIndex,
    setSelectedIndex,
    currentComponent,
    setCurrentComponent,
    visiblePageIndexes,
    setVisiblePageIndexes,
    visiblePages,
    openTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeTabsToLeft,
    closeAllTabs,
    openTabByTarget,
    updatePageContent,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}
