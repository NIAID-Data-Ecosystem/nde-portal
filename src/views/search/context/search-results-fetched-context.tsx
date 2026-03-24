import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/router';

type SearchFiltersGatePhase = 'waiting_for_results' | 'filters_enabled';

interface SearchResultsFetchedContextValue {
  isFiltersFetchEnabled: boolean;
  markResultsFetching: () => void;
  markResultsFetched: () => void;
}

// Context to gate filter fetching until initial search results have loaded.
// Lifecycle per search cycle:
//   URL changes → waiting_for_results (disabled)
//   Results fetched → filters_enabled (enabled, stays enabled until next URL change)
const SearchResultsFetchedContext = createContext<
  SearchResultsFetchedContextValue | undefined
>(undefined);

export const SearchResultsFetchedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const [gateState, setGateState] = useState({
    path: router.asPath,
    phase: 'waiting_for_results' as SearchFiltersGatePhase,
  });

  // Enabled once results are fetched for the current path.
  // Automatically disabled when the path changes (new search / filter click).
  const isFiltersFetchEnabled =
    gateState.path === router.asPath && gateState.phase === 'filters_enabled';

  const setPhaseForCurrentPath = useCallback(
    (phase: SearchFiltersGatePhase) => {
      setGateState(prev => {
        const next = { path: router.asPath, phase };
        if (prev.path === next.path && prev.phase === next.phase) {
          return prev;
        }
        return next;
      });
    },
    [router.asPath],
  );

  const markResultsFetching = useCallback(() => {
    setPhaseForCurrentPath('waiting_for_results');
  }, [setPhaseForCurrentPath]);

  const markResultsFetched = useCallback(() => {
    setPhaseForCurrentPath('filters_enabled');
  }, [setPhaseForCurrentPath]);

  return (
    <SearchResultsFetchedContext.Provider
      value={{
        isFiltersFetchEnabled,
        markResultsFetching,
        markResultsFetched,
      }}
    >
      {children}
    </SearchResultsFetchedContext.Provider>
  );
};

export const useSearchResultsFetchedContext = () => {
  const context = useContext(SearchResultsFetchedContext);
  if (!context) {
    throw new Error(
      'useSearchResultsFetchedContext must be used within a SearchResultsFetchedProvider',
    );
  }
  return context;
};
