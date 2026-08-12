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

  // Defer breadcrumb computation until after mount to avoid hydration
  // mismatches. The statically-exported 404 page is served for arbitrary
  // unmatched URLs, so the server renders it with `usePathname()` === '/404'
  // while the client computes segments from the real URL. The differing
  // segment counts shift which crumb is the "current page" (rendered as a
  // <span> instead of an <a>), which trips React's hydration check. Rendering
  // nothing on the server and first client render keeps them in sync; the real
  // breadcrumbs appear once mounted. This also makes the document.title
  // fallback below client-only, removing another source of mismatch.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use a state to hold the fallback title in case pageTitle is not provided
  const fallbackTitle =
    !pageTitle && typeof document !== 'undefined' ? document.title : '';

  const segments = useMemo(() => {
    if (!isMounted || !pathname) return [];

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
      // For the last route, priority to pageTitle if provided, otherwise use segment name or fallback title.
      name:
        idx === arr.length - 1
          ? pageTitle || segment.name || fallbackTitle
          : segment.name,
      isCurrentPage: idx === arr.length - 1,
    }));
  }, [
    isMounted,
    pathname,
    router.query.referrerPath,
    pageTitle,
    fallbackTitle,
  ]);

  return segments;
};
