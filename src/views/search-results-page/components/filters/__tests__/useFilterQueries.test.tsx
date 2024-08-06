import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterQueries } from '../hooks/useFilterQueries';
import React from 'react';
import { buildFacetQueryParams } from '../utils/queries';

// Mock FILTER_CONFIGS to return specific queries
jest.mock('../config', () => ({
  FILTER_CONFIGS: [
    {
      property: 'category',
      createQueries: jest.fn((params, options, isInitialQuery = false) => {
        // Destructure options to exclude queryKey and gather other options, with defaults
        const { queryKey = [] } = options || {};

        // omit filters from initialQuery to get full results back.
        const extra_filter = isInitialQuery ? '' : params.extra_filter;

        // add exists to get total count for "Any Specified"
        const extraFilterWithFacets = extra_filter
          ? `${extra_filter}${
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
            queryFn: async () => {
              return {
                facet: 'category',
                results: isInitialQuery
                  ? [
                      { term: 'electronics', count: 10 },
                      { term: 'books', count: 5 },
                    ]
                  : [
                      { term: 'electronics', count: 22 },
                      { term: 'books', count: 4 },
                    ],
              };
            },
          },
        ];
      }),
    },
  ],
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFilterQueries', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should return initial results and loading states correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useFilterQueries({
          q: '',
          facets: 'category',
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => !result.current.isLoading);

    expect(result.current.results).toEqual({
      category: [
        { term: 'electronics', count: 10, label: 'electronics' },
        { term: 'books', count: 5, label: 'books' },
      ],
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should merge initial and filtered results correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useFilterQueries({
          q: '',
          extra_filter: '@type:("Dataset")',
          facets: 'category',
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => !result.current.isLoading);

    expect(result.current.results).toEqual({
      category: [
        { term: 'electronics', count: 22, label: 'electronics' },
        { term: 'books', count: 4, label: 'books' },
      ],
    });
  });
});
