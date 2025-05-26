import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { TabType } from '../types';
import { defaultQuery } from '../config/defaultQuery';

export type PaginationState = {
  from: number;
  size: number;
};

interface PaginationContextValue {
  getPagination: (tabId: string) => PaginationState;
  setFrom: (tabId: string, from: number) => void;
  setSize: (tabId: string, size: number) => void;
  setPagination: (
    tabId: string,
    update: { from?: number; size?: number },
  ) => void;
  resetPagination: (tabId?: string) => void;
}

const PaginationContext = createContext<PaginationContextValue | undefined>(
  undefined,
);

// Pagination is handled by the tab-aware pagination hook.
// Route updates are handled separately.
export const PaginationProvider = ({
  tabs,
  children,
}: {
  tabs: TabType[];
  children: ReactNode;
}) => {
  const router = useRouter();

  const [paginationByTab, setPaginationByTab] = useState<
    Record<string, PaginationState>
  >(() =>
    Object.fromEntries(
      tabs.map(tab => [
        tab.id,
        { from: defaultQuery.from, size: defaultQuery.size },
      ]),
    ),
  );

  // Sync initial from value from the URL on first mount
  useEffect(() => {
    if (!router.isReady) return;

    const urlFrom = parseInt(router.query.from as string);
    const urlSize = parseInt(router.query.size as string);
    const urlTab = router.query.tab as string;

    if (!isNaN(urlFrom) && urlTab) {
      setPaginationByTab(prev => ({
        ...prev,
        [urlTab]: {
          ...prev[urlTab],
          from: urlFrom,
          size: urlSize || defaultQuery.size,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const getPagination = useCallback(
    (tabId: string) =>
      paginationByTab[tabId] || {
        from: defaultQuery.from,
        size: defaultQuery.size,
      },
    [paginationByTab],
  );

  const setFrom = useCallback((tabId: string, from: number) => {
    setPaginationByTab(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], from },
    }));
  }, []);

  const setSize = useCallback((tabId: string, size: number) => {
    setPaginationByTab(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], size }, // Reset from when size changes
    }));
  }, []);

  const setPagination = useCallback(
    (tabId: string, update: { from?: number; size?: number }) => {
      setPaginationByTab(prev => ({
        ...prev,
        [tabId]: { ...prev[tabId], ...update },
      }));
    },
    [],
  );

  const resetPagination = useCallback((tabId?: string) => {
    setPaginationByTab(prev => {
      const next = { ...prev };
      if (tabId) {
        next[tabId] = { ...next[tabId], from: defaultQuery.from };
      } else {
        Object.keys(next).forEach(id => {
          next[id] = { ...next[id], from: defaultQuery.from };
        });
      }
      return next;
    });
  }, []);

  return (
    <PaginationContext.Provider
      value={{
        getPagination,
        setFrom,
        setSize,
        resetPagination,
        setPagination,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

export const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within a PaginationProvider');
  }
  return context;
};
