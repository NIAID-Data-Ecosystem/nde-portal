import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nde.search.summary.activeVizIds.v1';

function safeParse(json: string | null): string[] | null {
  if (!json) return null;
  try {
    const val = JSON.parse(json);
    return Array.isArray(val) && val.every(v => typeof v === 'string')
      ? val
      : null;
  } catch {
    return null;
  }
}

export function useActiveVizIds(defaultIds: string[]) {
  const [activeVizIds, setActiveVizIds] = useState<string[]>(defaultIds);

  // hydrate from localStorage on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored) setActiveVizIds(stored);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeVizIds));
  }, [activeVizIds]);

  const isVizActive = useCallback(
    (id: string) => activeVizIds.includes(id),
    [activeVizIds],
  );

  const toggleViz = useCallback((id: string) => {
    setActiveVizIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const setViz = useCallback((id: string, next: boolean) => {
    setActiveVizIds(prev => {
      const has = prev.includes(id);
      if (next && !has) return [...prev, id];
      if (!next && has) return prev.filter(x => x !== id);
      return prev;
    });
  }, []);

  const api = useMemo(
    () => ({ activeVizIds, setActiveVizIds, isVizActive, toggleViz, setViz }),
    [activeVizIds, isVizActive, toggleViz, setViz],
  );

  return api;
}
