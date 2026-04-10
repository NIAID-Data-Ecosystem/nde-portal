import { useState, useEffect } from 'react';
import { EndpointStatus } from 'src/utils/status-helpers';
import { PAGE_DEPENDENCIES } from 'src/utils/page-dependencies';

const ALL_PATHS = PAGE_DEPENDENCIES.map(p => p.path);

/**
 * Lightweight availability check for all portal pages.
 * Sends a HEAD request to each route to verify it resolves.
 */
export function usePageAvailability() {
  const [statuses, setStatuses] = useState<
    Record<string, EndpointStatus | 'loading'>
  >(() => Object.fromEntries(ALL_PATHS.map(p => [p, 'loading' as const])));

  useEffect(() => {
    ALL_PATHS.forEach(async path => {
      try {
        const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
        setStatuses(prev => ({
          ...prev,
          [path]: res.ok ? 'operational' : 'down',
        }));
      } catch {
        setStatuses(prev => ({
          ...prev,
          [path]: 'down',
        }));
      }
    });
  }, []);

  return statuses;
}
