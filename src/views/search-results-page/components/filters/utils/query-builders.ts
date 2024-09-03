import {
  createCommonQuery,
  createQueryWithSourceMetadata,
  createNotExistsQuery,
  QueryArgs,
} from './queries';
import { FilterConfig } from '../types';

/**
 * Create queries for a given facet field.
 *
 * @param overrides - Optional overrides for the query arguments.
 * @returns Function to create queries for the given facet field.
 */
export const buildQueries =
  (overrides?: Partial<QueryArgs>): FilterConfig['createQueries'] =>
  (id, params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...queryOptions } = options || {};

    return [
      createCommonQuery({
        id,
        queryKey,
        params,
        ...queryOptions,
        ...overrides,
      }),
      createNotExistsQuery({
        id,
        queryKey,
        params,
        ...queryOptions,
        ...overrides,
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
  (overrides?: QueryArgs): FilterConfig['createQueries'] =>
  (id, params, options) => {
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...queryOptions } = options || {};

    return [
      createQueryWithSourceMetadata({
        id,
        queryKey,
        params,
        ...queryOptions,
        ...overrides,
      }),
    ];
  };
