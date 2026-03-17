import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Filters } from '../../components/filters';

const updateRoute = jest.fn();
const useFilterQueries = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/search' }),
}));

jest.mock('../../hooks/useFilterQueries', () => ({
  useFilterQueries: (...args: any[]) => useFilterQueries(...args),
}));

jest.mock('src/views/search/utils/update-route', () => ({
  updateRoute: (...args: any[]) => updateRoute(...args),
}));

jest.mock('src/views/search/hooks/useSearchQueryFromURL', () => ({
  useSearchQueryFromURL: () => ({
    q: 'virus',
    use_ai_search: 'false',
    filters: { topic: ['alpha'] },
  }),
}));

jest.mock('src/views/search/context/pagination-context', () => ({
  usePaginationContext: () => ({ resetPagination: jest.fn() }),
}));

jest.mock('src/views/search/config/defaultQuery', () => ({
  getDefaultDateRange: () => ['2020-01-01', '2021-12-31'],
}));

jest.mock('src/utils/feature-flags', () => ({
  shouldEnableInVisualSummaryPage: jest.fn(() => false),
}));

jest.mock('../../components/container', () => ({
  FiltersContainer: ({
    children,
    removeAllFilters,
    onVisibleFiltersChange,
  }: any) => {
    React.useEffect(
      () => onVisibleFiltersChange?.(['date', 'includedInDataCatalog']),
      [onVisibleFiltersChange],
    );
    return (
      <div>
        <button onClick={removeAllFilters}>clear-all</button>
        {children}
      </div>
    );
  },
}));

jest.mock('../../components/section', () => ({
  FiltersSection: ({ name, children }: any) => (
    <section>
      <h3>{name}</h3>
      {children}
    </section>
  ),
}));

jest.mock('../../components/list', () => ({
  FiltersList: ({ handleSelectedFilters }: any) => (
    <button onClick={() => handleSelectedFilters(['_exists_'])}>
      select-filter
    </button>
  ),
}));

jest.mock('../../components/date-filter', () => ({
  DateFilter: ({ handleSelectedFilter, resetFilter }: any) => (
    <>
      <button
        onClick={() => handleSelectedFilter(['2021-01-01', '2021-12-31'])}
      >
        select-date
      </button>
      <button onClick={resetFilter}>reset-date</button>
    </>
  ),
}));

describe('refactored-filters/components/filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFilterQueries.mockReturnValue({
      results: {
        includedInDataCatalog: {
          terms: [{ term: 'repo', label: 'Repo', count: 1 }],
          isLoading: false,
          isUpdating: false,
        },
      },
      error: null,
      isLoading: false,
      isUpdating: false,
    });
  });

  it('renders visible filters and updates route when selecting standard filter', () => {
    render(
      <Filters
        selectedFilters={{}}
        removeAllFilters={jest.fn()}
        onToggleViz={jest.fn()}
        isVizActive={() => false}
      />,
    );

    fireEvent.click(screen.getByText('select-filter'));
    expect(updateRoute).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ from: 1 }),
    );
  });

  it('routes date selection and clear-all action', () => {
    const removeAllFilters = jest.fn();
    render(
      <Filters
        selectedFilters={{ date: [] }}
        removeAllFilters={removeAllFilters}
      />,
    );

    fireEvent.click(screen.getByText('select-date'));
    fireEvent.click(screen.getByText('reset-date'));
    fireEvent.click(screen.getByText('clear-all'));
    expect(removeAllFilters).toHaveBeenCalled();
    expect(updateRoute).toHaveBeenCalled();
  });
});
