import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/router';

type SearchFiltersGatePhase = 'idle' | 'results_fetching' | 'filters_open';

interface SearchResultsFetchedContextValue {
  isFiltersFetchEnabled: boolean;
  markResultsFetching: () => void;
  markResultsFetched: () => void;
  markFiltersFetched: () => void;
}

// Context to track whether search results have been fetched. Used to enable filters fetching only after initial search results are fetched to improve performance.
const SearchResultsFetchedContext = createContext<
  SearchResultsFetchedContextValue | undefined
>(undefined);

export const SearchResultsFetchedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const [gateState, setGateState] = useState({
    path: router.asPath,
    phase: 'idle' as SearchFiltersGatePhase,
  });

  // Scope the gate to the current URL path+query so each search cycle starts disabled.
  const isFiltersFetchEnabled =
    gateState.path === router.asPath && gateState.phase === 'filters_open';

  const setPhaseForCurrentPath = useCallback(
    (phase: SearchFiltersGatePhase) => {
      setGateState(prev => {
        const next = {
          path: router.asPath,
          phase,
        };

        if (prev.path === next.path && prev.phase === next.phase) {
          return prev;
        }

        return next;
      });
    },
    [router.asPath],
  );

  const markResultsFetching = useCallback(() => {
    setPhaseForCurrentPath('results_fetching');
  }, [setPhaseForCurrentPath]);

  const markResultsFetched = useCallback(() => {
    setPhaseForCurrentPath('filters_open');
  }, [setPhaseForCurrentPath]);

  const markFiltersFetched = useCallback(() => {
    setPhaseForCurrentPath('idle');
  }, [setPhaseForCurrentPath]);

  return (
    <SearchResultsFetchedContext.Provider
      value={{
        isFiltersFetchEnabled,
        markResultsFetching,
        markResultsFetched,
        markFiltersFetched,
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
