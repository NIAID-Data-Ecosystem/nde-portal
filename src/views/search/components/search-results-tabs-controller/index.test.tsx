import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import React from 'react';
import { render, screen, waitFor } from 'src/__tests__/utils/render';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

import { PaginationProvider } from '../../context/pagination-context';
import { SearchTabsProvider } from '../../context/search-tabs-context';
import { SearchResultsController } from '.';

const buildFacets = (counts: Record<string, number>) =>
  ({
    '@type': {
      terms: Object.entries(counts).map(([term, count]) => ({ term, count })),
    },
  } as unknown as FetchSearchResultsResponse['facets']);

// Search results with Datasets but no Computational Tools. Kept as stable
// references, like React Query's `data`, so they only change when a test
// starts a new search.
const RESULTS_WITHOUT_TOOLS = {
  total: 5,
  results: [],
  facets: buildFacets({ Dataset: 5, ComputationalTool: 0 }),
} as unknown as FetchSearchResultsResponse;

const RESULTS_WITH_TOOLS = {
  total: 8,
  results: [],
  facets: buildFacets({ Dataset: 5, ComputationalTool: 3 }),
} as unknown as FetchSearchResultsResponse;

let mockFacetData: FetchSearchResultsResponse = RESULTS_WITHOUT_TOOLS;

jest.mock('src/views/search/hooks/useSearchResultsData', () => ({
  useSearchResultsData: (params: { facets?: string[] }) => ({
    // Only the `@type` facet query is read here; the Resource Catalog
    // carousel query has no records to show.
    response: params.facets
      ? { data: mockFacetData }
      : { data: undefined, isLoading: false, isPending: false },
    params: {},
  }),
}));

const mockQueryParams = { q: '__all__', filters: {}, use_ai_search: 'false' };
jest.mock('src/views/search/hooks/useSearchQueryFromURL', () => ({
  useSearchQueryFromURL: () => mockQueryParams,
}));

const mockBioSampleAggregation = { data: { total: 0 } };
jest.mock('src/views/search/hooks/useBioSampleAggregation', () => ({
  BIOSAMPLE_EXTRA_FILTER: '',
  useBioSampleAggregation: () => mockBioSampleAggregation,
}));

const mockDiseaseData = {
  diseases: [],
  loading: false,
  hasMatchingDiseases: false,
};
jest.mock('src/views/search/hooks/useDiseaseData', () => ({
  useDiseaseData: () => mockDiseaseData,
}));

const mockProgramInfo = { programCollections: [], hasProgramInfo: false };
jest.mock('src/views/search/hooks/useProgramInfoCollections', () => ({
  useProgramInfoCollections: () => mockProgramInfo,
}));

// The results list fetches its own page of results (and shows the empty state
// when there are none); here we only need to know which section is rendered.
jest.mock('src/views/search/components/results-list', () => ({
  SearchResults: ({ types }: { types: string[] }) => (
    <div>{`${types.join(', ')} results`}</div>
  ),
}));

const renderController = () => {
  const queryClient = new QueryClient();
  const ui = () => (
    <QueryClientProvider client={queryClient}>
      <SearchTabsProvider initialTab='d'>
        <PaginationProvider>
          <SearchResultsController initialData={RESULTS_WITHOUT_TOOLS} />
        </PaginationProvider>
      </SearchTabsProvider>
    </QueryClientProvider>
  );
  const utils = render(ui());
  return { ...utils, rerender: () => utils.rerender(ui()) };
};

const getToolsTab = () => screen.getByRole('tab', { name: /Tools/ });

describe('SearchResultsController tabs', () => {
  beforeEach(() => {
    mockFacetData = RESULTS_WITHOUT_TOOLS;
    mockRouter.setCurrentUrl('/search?q=__all__');
  });

  it('opens a tab with no results so its empty state can be shown', async () => {
    const user = userEvent.setup();
    renderController();

    await user.click(getToolsTab());

    await waitFor(() =>
      expect(mockRouter).toMatchObject({ query: { tab: 'ct' } }),
    );
    expect(getToolsTab()).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('ComputationalTool results')).toBeVisible();
  });

  it('leaves a user-chosen tab when a new search gives it no results', async () => {
    mockFacetData = RESULTS_WITH_TOOLS;
    const user = userEvent.setup();
    const { rerender } = renderController();

    await user.click(getToolsTab());
    expect(getToolsTab()).toHaveAttribute('aria-selected', 'true');

    mockFacetData = RESULTS_WITHOUT_TOOLS;
    act(() => rerender());

    await waitFor(() =>
      expect(getToolsTab()).toHaveAttribute('aria-selected', 'false'),
    );
    expect(mockRouter).toMatchObject({ query: { tab: 'd' } });
  });
});
