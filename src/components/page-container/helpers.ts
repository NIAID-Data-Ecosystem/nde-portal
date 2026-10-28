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

// Stand-in origin used only to resolve relative paths. A value that resolves
// to any other origin carried its own scheme or host.
const PLACEHOLDER_ORIGIN = 'https://placeholder.invalid';

/**
 * Validates that a value is a root-relative path on this site and returns it
 * normalized, so it is safe to use as a link target. Rejects values with a
 * scheme (e.g. `javascript:`, `https:`) or that resolve to another host
 * (e.g. `//host`, `/\host`).
 *
 * @param value - The untrusted value, e.g. a query parameter.
 * @param allowedPathnames - If provided, the path's pathname must be one of these.
 * @returns The normalized path (pathname, search, and hash), otherwise undefined.
 */
export const getSafeInternalPath = (
  value: unknown,
  allowedPathnames?: string[],
): string | undefined => {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;

  let url: URL;
  try {
    url = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return undefined;
  }

  if (url.origin !== PLACEHOLDER_ORIGIN) return undefined;
  if (allowedPathnames && !allowedPathnames.includes(url.pathname)) {
    return undefined;
  }

  // Dot segments can normalize to a leading `//` (e.g. `/.//host`), which a
  // browser would treat as a protocol-relative URL to another host.
  const path = url.pathname + url.search + url.hash;
  return path.startsWith('//') ? undefined : path;
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
