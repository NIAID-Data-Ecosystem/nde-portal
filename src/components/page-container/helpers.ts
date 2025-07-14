import CONFIG from 'configs/site.config.json';
import { SiteConfig } from './types';

/**
 * Recursively searches for a route label based on the provided path.
 *
 * @param path - The path to search for.
 * @param config - The array of route objects to search within.
 * @returns The label of the route if found, otherwise undefined.
 */
export const getLabelFromRoute = (
  path: string,
  config: SiteConfig['pages'] = CONFIG.pages,
): string | undefined => {
  return config[path]?.nav?.label || config[path]?.seo?.title || '';
};

/**
 * Formats a slug by replacing hyphens and underscores with spaces
 * and capitalizing the first letter of each word. Should be used as a fallback
 *
 * @param slug - The slug to format.
 * @returns The formatted string.
 */
export const formatSlug = (slug: string): string => {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
