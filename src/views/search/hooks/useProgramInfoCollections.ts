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

interface UseProgramInfoCollectionsOptions {
  q?: string;
  filters?: SelectedFilterType;
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
 * search; otherwise only those whose sourceOrganization name, abstract or
 * description match the query.
 */
export const useProgramInfoCollections = ({
  q,
  filters,
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

  const programCollections = useMemo(() => {
    if (!isEnabled || !collections) return EMPTY_COLLECTIONS;

    const programInfoCollections = collections
      .filter(isProgramInfoCollection)
      .sort(sortByName);

    if (isDefaultSearch) return programInfoCollections;

    const relevant = programInfoCollections.filter(collection =>
      matchesProgramQuery(collection, q),
    );

    return relevant.length > 0 ? relevant : EMPTY_COLLECTIONS;
  }, [isEnabled, collections, isDefaultSearch, q]);

  return {
    programCollections,
    isLoading: isEnabled && collectionsIsLoading,
    hasProgramInfo: programCollections.length > 0,
  };
};
