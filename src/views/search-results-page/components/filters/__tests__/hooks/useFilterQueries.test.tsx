import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterQueries } from '../../hooks/useFilterQueries';
import React from 'react';
import { buildFacetQueryParams } from '../../utils/queries';
import { FilterConfig } from '../../types';

const config = [
  {
    property: 'category',
    createQueries: jest.fn((params, options) => {
      // Destructure options to exclude queryKey and gather other options, with defaults
      const { queryKey = [] } = options || {};

      // add exists to get total count for "Any Specified"
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
          queryFn: async () => {
            if (queryParams.extra_filter?.includes('_exists_:category')) {
              return {
                total: 26,
                facet: 'category',
                results: [
                  { term: 'electronics', count: 22 },
                  { term: 'books', count: 4 },
                ],
              };
            }
            return {
              total: 15,
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
  } as unknown as FilterConfig,
];

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

    await waitFor(() => !result.current.isLoading);

    expect(result.current.results).toEqual({
      category: [
        { term: 'electronics', count: 22, label: 'electronics' },
        { term: 'books', count: 4, label: 'books' },
      ],
    });
  });
});
