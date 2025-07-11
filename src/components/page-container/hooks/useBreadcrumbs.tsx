import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { formatSlug, getLabelFromRoute } from '../helpers';
import { usePathname } from 'next/navigation';

export interface BreadcrumbSegment {
  name: string;
  route: string;
  isCurrentPage: boolean;
}

export const useBreadcrumbs = (pageTitle?: string): BreadcrumbSegment[] => {
  const router = useRouter();
  const pathname = usePathname();

  // Use a state to hold the fallback title in case pageTitle is not provided
  const [fallbackTitle, setFallbackTitle] = useState<string>('');

  useEffect(() => {
    if (!pageTitle && typeof document !== 'undefined') {
      setFallbackTitle(document.title);
    }
  }, [pageTitle]);

  const segments = useMemo(() => {
    if (!pathname) return [];

    const parts = pathname.split('/').filter(Boolean);
    let mapped = parts.map((slug, idx) => {
      const route = '/' + parts.slice(0, idx + 1).join('/');
      const name = getLabelFromRoute(route) || formatSlug(slug);
      return { name, route };
    });

    // If the pathname starts with /resources, prepend a Search segment
    // based on the referrerPath query parameter
    if (pathname.startsWith('/resources')) {
      const searchRoute =
        typeof router.query.referrerPath === 'string' &&
        router.query.referrerPath.includes('/search')
          ? router.query.referrerPath
          : '/search';

      mapped = [
        {
          name: getLabelFromRoute(searchRoute) || 'Search',
          route: searchRoute,
        },
        ...mapped,
      ];
    }

    return mapped.map((segment, idx, arr) => ({
      ...segment,
      // Use pageTitle if provided, otherwise use fallbackTitle or segment name
      name:
        idx === arr.length - 1
          ? pageTitle || segment.name || fallbackTitle
          : segment.name,
      isCurrentPage: idx === arr.length - 1,
    }));
  }, [pathname, router.query.referrerPath, pageTitle, fallbackTitle]);

  return segments;
};
