import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { buildFacetQueryParams } from '../../utils/queries';
import { FilterConfig, QueryData, RawQueryResult } from '../../types';
import { mergeResults, useFilterQueries } from '../../hooks/useFilterQueries';

const config = [
  {
    _id: 'category_id',
    name: 'Category Filter',
    description: 'A filter for categories',
    property: 'category',
    createQueries: jest.fn((id, params, options) => {
      // Destructure options to exclude queryKey and gather other options, with defaults
      const { queryKey = [] } = options || {};

      // add exists to get total count for resource with category
      const extraFilterWithFacets = params.extra_filter
        ? `${params.extra_filter}${
            params.facets ? ` AND _exists_:${params.facets}` : ''
          }`
        : params.facets
        ? `_exists_:${params.facets}`
        : '';

      const queryParams = buildFacetQueryParams({
        ...params,
        extra_filter: extraFilterWithFacets,
      });

      return [
        {
          queryKey: [...queryKey, queryParams],
          queryFn: async (): Promise<RawQueryResult> => {
            if (params.extra_filter) {
              return {
                id,
                // total: 26,
                facet: 'category',
                results: [
                  { term: 'electronics', count: 22 },
                  { term: 'books', count: 4 },
                ],
              };
            }
            return {
              id,
              // total: 15,
              facet: 'category',
              results: [
                { term: 'electronics', count: 10 },
                { term: 'books', count: 5 },
              ],
            };
          },
        },
      ];
    }),
    tabIds: ['d'],
  } as FilterConfig,
];

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFilterQueries', () => {
  const id = config[0]._id;

  beforeEach(() => {
    queryClient.clear();
  });

  it('should return initial results and loading states correctly', async () => {
    const { result } = renderHook(
      () =>
        useFilterQueries({
          initialParams: {
            q: '__all__',
          },
          updateParams: {
            q: '__all__',
          },
          config,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.results[id].status).toBe('success');
    expect(result.current.results[id].isSuccess).toBe(true);
    expect(result.current.results[id].data).toEqual([
      { term: 'electronics', count: 10, label: 'electronics' },
      { term: 'books', count: 5, label: 'books' },
    ]);
  });

  it('should merge initial and filtered results correctly', async () => {
    const { result } = renderHook(
      () =>
        useFilterQueries({
          initialParams: {
            q: '__all__',
          },
          updateParams: {
            q: '__all__',
            extra_filter: '_exists_:category',
          },
          config,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.results).toEqual({
      [id]: {
        data: [
          { term: 'electronics', count: 22, label: 'electronics' },
          { term: 'books', count: 4, label: 'books' },
        ],
      },
    });
  });

  it('should correctly handle cases where initial results have terms not present in updated results', () => {
    const initialResults: QueryData = {
      [id]: {
        data: [
          { term: 'electronics', count: 10, label: 'electronics' },
          { term: 'books', count: 5, label: 'books' },
          { term: 'furniture', count: 3, label: 'furniture' },
        ],
      } as QueryData['string'],
    };

    const updatedResults: QueryData = {
      [id]: {
        data: [
          { term: 'electronics', count: 22, label: 'electronics' },
          { term: 'books', count: 4, label: 'books' },
        ],
      } as QueryData['string'],
    };

    const expectedMergedResults: QueryData = {
      [id]: {
        data: [
          { term: 'electronics', count: 22, label: 'electronics' },
          { term: 'books', count: 4, label: 'books' },
          { term: 'furniture', count: 0, label: 'furniture' }, // Count set to 0 since it's not in updatedResults
        ],
      } as QueryData['string'],
    };

    const result = mergeResults(initialResults, updatedResults);

    expect(result).toEqual(expectedMergedResults);
  });
});
