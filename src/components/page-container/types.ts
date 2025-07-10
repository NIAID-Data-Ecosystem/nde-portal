import { Footer } from '../footer/types';
import { Navigation, NavigationItem } from '../navigation-bar/types';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  //add url
}

export interface PageConfig {
  seo: SeoMetadata;
  nav?: NavigationItem;
}

export interface SiteConfig {
  pages: Record<string, PageConfig>;
  navigation: Navigation;
  footer: Footer;
}

// Helper type for getting page paths
export type PagePath = keyof SiteConfig['pages'];

// Helper type for getting SEO data
export type PageSeo<T extends PagePath> = SiteConfig['pages'][T]['seo'];
