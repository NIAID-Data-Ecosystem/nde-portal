import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchProgramCollections,
  isProgramInfoCollection,
  matchesProgramQuery,
  ProgramCollection,
} from 'src/views/program-collections/helpers';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { SHOW_PROGRAM_RESOURCE_UI } from 'src/utils/feature-flags';
import {
  APPLY_DEFAULT_DATE_FILTER_KEY,
  defaultQuery,
} from '../config/defaultQuery';
import { useSearchResultsData } from './useSearchResultsData';

interface UseProgramInfoCollectionsOptions {
  q?: string;
  filters?: SelectedFilterType;
  use_ai_search?: string;
  enabled?: boolean;
}

// Stable empty array so consumers' memos don't invalidate on every render.
const EMPTY_COLLECTIONS: ProgramCollection[] = [];

// Filters that are applied by default and don't count as a user search.
const DEFAULT_FILTER_KEYS = ['date', APPLY_DEFAULT_DATE_FILTER_KEY];

const sortByName = (a: ProgramCollection, b: ProgramCollection) =>
  (a.sourceOrganization?.name || a.term).localeCompare(
    b.sourceOrganization?.name || b.term,
  );

/**
 * Program collections without a resource catalog, displayed as "Program Info"
 * cards in the search carousel. All of them are returned when there is no
 * search; otherwise only those whose name, alternate names or abstract match
 * the query, or that have resources matching the current query and filters.
 */
export const useProgramInfoCollections = ({
  q,
  filters,
  use_ai_search,
  enabled = true,
}: UseProgramInfoCollectionsOptions) => {
  const isEnabled = SHOW_PROGRAM_RESOURCE_UI && enabled;

  const isDefaultSearch =
    (!q || q.trim() === defaultQuery.q) &&
    Object.entries(filters || {}).every(
      ([key, values]) =>
        DEFAULT_FILTER_KEYS.includes(key) ||
        !Array.isArray(values) ||
        values.length === 0,
    );

  // Shares its cache with the program collections page.
  const { data: collections, isLoading: collectionsIsLoading } = useQuery({
    queryKey: ['program-collections'],
    queryFn: () => fetchProgramCollections(0),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Names of the programs that have resources matching the current search.
  const facetResponse = useSearchResultsData(
    {
      q: q || defaultQuery.q,
      filters,
      facets: ['sourceOrganization.name'],
      facet_size: 1000,
      size: 0,
      use_ai_search: use_ai_search ?? 'false',
    },
    { enabled: isEnabled && !isDefaultSearch },
  ).response;

  const facetTerms =
    facetResponse.data?.facets?.['sourceOrganization.name']?.terms;

  const programCollections = useMemo(() => {
    if (!isEnabled || !collections) return EMPTY_COLLECTIONS;

    const programInfoCollections = collections
      .filter(isProgramInfoCollection)
      .sort(sortByName);

    if (isDefaultSearch) return programInfoCollections;

    const matchingNames = new Set(
      (facetTerms || []).map(({ term }) => term.toLowerCase()),
    );

    const relevant = programInfoCollections.filter(
      collection =>
        matchesProgramQuery(collection, q) ||
        matchingNames.has(collection.term.toLowerCase()),
    );

    return relevant.length > 0 ? relevant : EMPTY_COLLECTIONS;
  }, [isEnabled, collections, isDefaultSearch, facetTerms, q]);

  return {
    programCollections,
    isLoading:
      isEnabled &&
      (collectionsIsLoading || (!isDefaultSearch && facetResponse.isLoading)),
    hasProgramInfo: programCollections.length > 0,
  };
};
