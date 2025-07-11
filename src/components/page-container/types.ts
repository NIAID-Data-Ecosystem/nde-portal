import { Footer } from '../footer/types';
import { Navigation, NavigationItem } from '../navigation-bar/types';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  preventIndexing?: boolean; // if true, adds noindex meta tags to prevent indexing - useful for 404 page
}

export interface PageConfig {
  seo: SeoMetadata;
  nav?: NavigationItem;
  env?: string[]; // used to restrict page visibility based on environment
}

export interface SiteConfig {
  site: {
    name: string;
    previewImage: string;
    seo: SeoMetadata;
  };
  pages: Record<string, PageConfig>;
  navigation: Navigation;
  footer: Footer;
}

// Helper type for getting page paths
export type PagePath = keyof SiteConfig['pages'];

// Helper type for getting SEO data
export type PageSeo<T extends PagePath> = SiteConfig['pages'][T]['seo'];
