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
