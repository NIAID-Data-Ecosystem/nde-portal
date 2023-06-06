import { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchSearchResults, Params } from 'src/utils/api';
import { formatDate, formatISOString, formatType } from 'src/utils/api/helpers';
import { Facet, FacetTerm, FormattedResource } from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { FacetTerms } from '../types';
import REPOS from 'configs/repositories.json';

export const formatFacetTermDisplay = (term: string, facet: string) => {
  if (facet === '@type') {
    return formatType(term);
  } else if (facet === 'date') {
    return formatDate(term)?.split('-')[0];
  } else if (facet === 'date') {
    return formatDate(term)?.split('-')[0];
  } else if (facet === 'includedInDataCatalog.name') {
    return REPOS.repositories.find(repo => repo.id === term)?.label || term;
  }
  return term;
};

interface UseFilterDataProps {
  queryParams: Params;
  facets: string[];
}

export const useFacetsData = ({
  queryParams,
  facets,
}: UseFilterDataProps): [
  {
    data: FacetTerms;
    error: Error | null;
    isLoading: boolean;
    isUpdating: boolean;
  },
] => {
  const [facetTerms, setFacetTerms] = useState<FacetTerms>({});

  // Retrieve all data and updated counts.
  const fetchFilters = async (params: Params) => {
    if (!params.q || typeof params.q !== 'string') {
      return;
    }
    const data = await fetchSearchResults({
      ...params,
      q:
        queryParams.advancedSearch === 'true'
          ? params.q
          : encodeString(params.q),
      hist: 'date',
      size: 0,
    }).then(response => {
      const facetsData = {} as { [key: string]: { terms: FacetTerm[] } };
      if (response?.facets) {
        Object.keys(response.facets).map(facet => {
          if (facet === 'date') {
            return;
          }
          let facetKey = facet === 'hist_dates' ? 'date' : facet;
          facetsData[facetKey] = {
            terms: response.facets[facet].terms.map((t: FacetTerm) => {
              let term = t.term;
              if (facet === 'hist_dates') {
                term = formatISOString(t.term);
              }

              return {
                ...t,
                term,
                displayAs: formatFacetTermDisplay(term, facetKey),
                facet: facetKey,
              };
            }),
          };
        });
      }
      return facetsData;
    });

    // Data for missing datasets with no facet term. (aka. n/a value in filter).
    await Promise.all(
      facets.map(facet => {
        /* Fetch facets using query params. Note that we also get the facets count where data is non-existent to be used as an "N/A" attribute. */
        return fetchSearchResults({
          q:
            queryParams.advancedSearch === 'true'
              ? params.q
              : encodeString(params.q),

          extra_filter: params?.extra_filter
            ? `${params.extra_filter} AND -_exists_:${facet}`
            : `-_exists_:${facet}`,
          facet_size: 0, // just need the total
          size: 0,
        }).then(response => {
          if (!data || !response?.total) return;

          const empty = {
            count: response?.total || 0,
            term: '-_exists_',
            displayAs: 'Not Specified',
            facet,
          };
          // add facet term for "empty" property
          data[facet].terms.unshift(empty);
          return empty;
        });
      }),
    );
    return data;
  };

  // We need 2 queries:
  interface FiltersResponse {
    [key: keyof FormattedResource]: {
      term: string;
      count: number;
      updatedCount?: number;
      name?: string;
      displayAs: string;
    }[];
  }
  // 1. Shows all filters for a given search. (omit extra_filters). Runs on load/new querystring.
  const {
    isLoading,
    error: allFiltersError,
    data: initialData,
  } = useQuery<
    { [key: string]: { terms: FacetTerm[] } } | undefined,
    Error,
    FiltersResponse
  >(
    [
      'search-results',
      {
        q: queryParams.q,
        facet_size: queryParams.facet_size,
        facets,
      },
    ],
    () => {
      return fetchFilters({
        q: queryParams.q,
        extra_filter: '',
        facet_size: queryParams.facet_size,
        facets: facets.filter(facet => facet !== 'date').join(','),
        size: 0,
      });
    },
    {
      // enabled: !!hasMounted,
      refetchOnWindowFocus: false,
      select: data => {
        const obj: FiltersResponse = {};
        if (data) {
          Object.keys(data).map(facet => {
            // order facet terms according to number of resources.
            obj[facet] = data[facet].terms.sort((a, b) => b.count - a.count);

            return;
          });
        }
        return obj;
      },
      onSuccess(data: FiltersResponse) {
        setFacetTerms(prev => ({ ...prev, ...data }));
      },
    },
  );
  // 2. Update counts on facet when filters are applied to searchquery from 1. Runs on load/new querystring and when filters are changed.
  const { isLoading: isUpdating, error: updatedFiltersError } = useQuery<
    { [key: string]: { terms: FacetTerm[] } } | undefined,
    Error,
    Facet
  >(
    [
      'search-results',
      {
        q: queryParams.q,
        extra_filter: queryParams.extra_filter,
        facet_size: queryParams.facet_size,
        facets,
        initialData,
      },
    ],
    () => {
      return fetchFilters({
        q: queryParams.q,
        facet_size: queryParams.facet_size,
        extra_filter: queryParams.extra_filter,
        facets: facets.join(','),
        size: 0,
      });
    },
    {
      refetchOnWindowFocus: false,
      // Only run if there is data to update.
      enabled: !!(initialData && Object.values(initialData).length > 0),

      onSuccess(data) {
        /*
        Note that the enabled parameter prevent the query from running but if cached data is available, onSuccess will use that data so we need to check again and return if the same requirements for enabled are false.
        See here: https://tanstack.com/query/v4/docs/guides/disabling-queries
        */
        if (!!(initialData && Object.values(initialData).length > 0)) {
          // Check if updated facets have changed count..
          setFacetTerms(prev => {
            const facetTermsData = { ...prev };
            Object.keys(facetTermsData).map(facet => {
              const updatedTerms = facetTermsData[facet].map(facetTerm => {
                const updateFacetTerm = { ...facetTerm };
                // Check if element is in updated data.
                const updatedItem = data[facet].terms.find(
                  el => el.term === facetTerm.term,
                );
                // if item count has changed, update state with new count.
                if (updatedItem) {
                  updateFacetTerm.count = updatedItem.count;
                } else {
                  // if term is not in updated list then we set the count to zero.
                  updateFacetTerm.count = 0;
                }
                return updateFacetTerm;
              });
              facetTermsData[facet] = updatedTerms.sort(
                (a, b) => b.count - a.count,
              );
            });
            return facetTermsData;
          });
        }
      },
    },
  );
  const error = allFiltersError || updatedFiltersError;
  return [
    {
      data: facetTerms,
      error,
      isLoading,
      isUpdating,
    },
  ];
};
