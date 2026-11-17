import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import { tabs } from '../../../config/tabs';
import { PaginationProvider } from '../../../context/pagination-context';
import { SearchResultsFetchedProvider } from '../../../context/search-results-fetched-context';
import { SearchTabsProvider } from '../../../context/search-tabs-context';
import { useSearchResultsData } from '../../../hooks/useSearchResultsData';
import { TabType } from '../../../types';
import { SearchResults } from '..';

jest.mock('../../../hooks/useSearchResultsData', () => ({
  useSearchResultsData: jest.fn(),
}));
// Only whether a card is a loading placeholder matters here.
jest.mock('../components/card', () => ({
  __esModule: true,
  default: ({ loading }: { loading: boolean }) => (
    <div data-testid='card' data-loading={loading} />
  ),
}));

/*
An empty page is held as loading while the tab counts are pending: those can
move the page to the tab that has the results, so showing "No results found"
first flashes it up for a filter that does have results.
*/

const SAMPLE = {
  _id: 's-1',
  id: 's-1',
  '@type': 'Sample',
  name: 'A sample',
} as unknown as FormattedResource;

const mockResults = (results: FormattedResource[]) =>
  (useSearchResultsData as jest.Mock).mockReturnValue({
    response: {
      data: { results, total: results.length, facets: {} },
      isLoading: false,
      isRefetching: false,
      isFetching: false,
      isFetched: true,
      error: null,
    },
    params: { q: '__all__' },
  });

const renderResults = async (id: TabType['id'], tabCountsPending: boolean) => {
  const type = tabs.find(tab => tab.id === id)!.types[0].type;
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <SearchTabsProvider initialTab={id}>
        <PaginationProvider>
          <SearchResultsFetchedProvider>
            <SearchResults
              id={id}
              tabs={tabs}
              types={[type]}
              tabCountsPending={tabCountsPending}
            />
          </SearchResultsFetchedProvider>
        </PaginationProvider>
      </SearchTabsProvider>
    </QueryClientProvider>,
  );
  // The toolbar's zag widgets start their machines in a microtask.
  await act(async () => {});
  return view;
};

describe('SearchResults empty state', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/search');
    window.localStorage.clear();
  });

  it('shows the empty state once the tab counts are in', async () => {
    mockResults([]);
    await renderResults('d', false);

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('holds an empty page as loading while the tab counts are pending', async () => {
    mockResults([]);
    await renderResults('d', true);

    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
    // Card view: placeholder cards stand in for the results.
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(card => expect(card).toHaveAttribute('data-loading', 'true'));
  });

  it('keeps a table loading, not empty, while the tab counts are pending', async () => {
    mockResults([]);
    await renderResults('s', true);

    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows results straight away while the tab counts are pending', async () => {
    mockResults([SAMPLE]);
    await renderResults('s', true);

    expect(screen.getByText('A sample')).toBeInTheDocument();
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-busy');
  });
});
