export interface DocumentationProps {
  id: number;
  name: string;
  description: string;
  subtitle: string;
  slug: string | string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  category: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface DocumentationByCategories {
  id: number;
  name: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  docs: {
    id: DocumentationProps['id'];
    name: DocumentationProps['name'];
    slug: DocumentationProps['slug'];
    description: string;
  }[];
}

export interface ContentHeading {
  title: string;
  hash: string;
  depth: number;
}

export interface SidebarContent {
  id: number;
  name: string;
  items: {
    id: number;
    name: string;
    slug: string | string[];
    description?: string;
    href: {
      pathname: string;
      query?: {
        q?: string;
      };
    };
  }[];
}

export interface SidebarMobileProps {
  isLoading: boolean;
  menuTitle?: string;
  sections?: SidebarContent[];
  selectedSlug?: string;
  colorScheme?: string;
}

export interface SidebarDesktopProps {
  isLoading: boolean;
  sections?: SidebarContent[];
  selectedSlug?: string;
  colorScheme?: string;
}

export interface DocumentItemProps {
  item: SidebarContent['items'][0];
  selectedSlug?: string;
  colorScheme: string;
  isLoading: boolean;
  activePageSlug?: string;
}

export interface TocItemProps {
  tocItem: ContentHeading;
  pageSlug: string;
  indent: number;
  parentTocItems?: ContentHeading[];
  isParentSelected?: boolean;
  activePageSlug?: string;
}

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
  currentInputValue: string;
  setCurrentInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export interface DocsSearchBarProps {
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}
