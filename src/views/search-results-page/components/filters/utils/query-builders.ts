import {
  createCommonQuery,
  createCommonQueryWithMetadata,
  createNotExistsQuery,
} from './queries';
import { FilterConfig } from '../types';

/**
 * Create queries for a given facet field.
 *
 * @param facetField - The facet field to filter by.
 * @returns Function to create queries for the given facet field.
 */
export const buildQueries =
  (facetField: string): FilterConfig['createQueries'] =>
  (params, options, isInitialQuery = false) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...queryOptions } = options || {};

    // omit filters from initialQuery to get full results back.
    const extra_filter = isInitialQuery ? '' : params.extra_filter;

    return [
      createCommonQuery({
        queryKey,
        params: { ...params, extra_filter, facets: facetField },
        ...queryOptions,
      }),
      createNotExistsQuery({
        queryKey,
        params: { ...params, facets: facetField },
        ...queryOptions,
      }),
    ];
  };

/**
 * Create queries for the "Sources" facet field.
 *
 * @param facetField - The facet field to filter by.
 * @returns Function to create queries for the "Sources" facet field.
 */
export const buildSourceQueries =
  (facetField: string): FilterConfig['createQueries'] =>
  (params, options, isInitialQuery) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...otherOptions } = options || {};
    // omit filters from initialQuery to get full results back.
    const extra_filter = isInitialQuery ? '' : params.extra_filter;

    return [
      createCommonQueryWithMetadata({
        queryKey,
        params: { ...params, extra_filter, facets: facetField },
        ...otherOptions,
      }),
    ];
  };
