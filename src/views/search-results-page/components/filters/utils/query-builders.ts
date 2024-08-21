import {
  createCommonQuery,
  createQueryWithSourceMetadata,
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
  (params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...queryOptions } = options || {};

    return [
      createCommonQuery({
        queryKey,
        params: { ...params, facets: facetField },
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
  (params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...otherOptions } = options || {};

    return [
      createQueryWithSourceMetadata({
        queryKey,
        params: { ...params, facets: facetField },
        ...otherOptions,
      }),
    ];
  };
