import {
  createCommonQuery,
  createCommonQueryWithMetadata,
  createNotExistsQuery,
} from './queries';
import { FilterConfig } from '../types';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { formatTerms } from '../helpers';

/**
 * Create queries for a given facet field.
 *
 * @param facetField - The facet field to filter by.
 * @param formatLabel - Function to format the label of the facet terms.
 * @returns Function to create queries for the given facet field.
 */
export const buildQueries =
  (
    facetField: string,
    formatLabel?: (term: string) => string,
  ): FilterConfig['createQueries'] =>
  (params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...otherOptions } = options || {};
    return [
      createCommonQuery({
        queryKey,
        params: { ...params, facets: params?.facets || facetField },
        select: (data: FetchSearchResultsResponse) => {
          return formatTerms(data, facetField, formatLabel);
        },
        ...otherOptions,
      }),
      createNotExistsQuery({
        queryKey,
        params: { ...params, facets: params?.facets || facetField },
        ...otherOptions,
      }),
    ];
  };

/**
 * Create queries for the "Sources" facet field.
 *
 * @param facetField - The facet field to filter by.
 * @param formatLabel - Function to format the label of the facet terms.
 * @returns Function to create queries for the "Sources" facet field.
 */
export const buildSourceQueries =
  (facetField: string): FilterConfig['createQueries'] =>
  (params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...otherOptions } = options || {};
    return [
      createCommonQueryWithMetadata({
        queryKey,
        params: { ...params, facets: params?.facets || facetField },
        ...otherOptions,
      }),
    ];
  };
