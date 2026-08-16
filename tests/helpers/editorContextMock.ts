export interface EditorContextTestValue {
  pages: jest.Mock[];
  setPages: jest.Mock;
  selectedIndex: number;
  setSelectedIndex: jest.Mock;
  currentComponent: string;
  setCurrentComponent: jest.Mock;
  visiblePageIndexes: number[];
  setVisiblePageIndexes: jest.Mock;
  visiblePages: jest.Mock[];
  openTab: jest.Mock;
  closeTab: jest.Mock;
  closeOtherTabs: jest.Mock;
  closeTabsToRight: jest.Mock;
  closeTabsToLeft: jest.Mock;
  closeAllTabs: jest.Mock;
  openTabByTarget: jest.Mock;
  updatePageContent: jest.Mock;
}

export const mockEditorContextValue: EditorContextTestValue = {
  pages: [],
  setPages: jest.fn(),
  selectedIndex: -1,
  setSelectedIndex: jest.fn(),
  currentComponent: '',
  setCurrentComponent: jest.fn(),
  visiblePageIndexes: [],
  setVisiblePageIndexes: jest.fn(),
  visiblePages: [],
  openTab: jest.fn(),
  closeTab: jest.fn(),
  closeOtherTabs: jest.fn(),
  closeTabsToRight: jest.fn(),
  closeTabsToLeft: jest.fn(),
  closeAllTabs: jest.fn(),
  openTabByTarget: jest.fn(),
  updatePageContent: jest.fn(),
};
