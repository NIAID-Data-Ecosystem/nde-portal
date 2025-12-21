import { DocumentationProps } from '../MainContent';

export interface SearchResult {
  id: DocumentationProps['id'];
  name: DocumentationProps['name'];
  slug: string;
  description: DocumentationProps['description'];
}

export interface SearchResultItemProps {
  index: number;
  result: SearchResult;
  searchTerm: string;
  colorScheme: string;
  onClick: () => void;
}

export interface SearchBarProps {
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  searchHistory: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
  currentCursorMax: number;
  setCurrentCursorMax: React.Dispatch<React.SetStateAction<number>>;
}

export interface DocsSearchBarProps {
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}
