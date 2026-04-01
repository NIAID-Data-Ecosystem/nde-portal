import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateFilter } from '../../../components/date-filter';

const useAggregation = jest.fn();
const useDateFilterData = jest.fn();

jest.mock('src/views/search/hooks/useAggregation', () => ({
  useAggregation: (...args: any[]) => useAggregation(...args),
  ALL_FACET_PROPERTIES: 'date',
}));

jest.mock('../../../utils/query-string', () => ({
  queryFilterObject2String: jest.fn(() => '(topic:("x"))'),
  queryFilterString2Object: jest.fn(() => ({
    date: ['2020-01-01', '2021-12-31'],
    topic: ['x'],
  })),
}));

jest.mock('../../../config', () => ({
  FILTER_CONFIGS: [{ id: 'date', property: 'date' }],
}));

jest.mock('../../../components/date-filter/hooks/useDateFilterData', () => ({
  useDateFilterData: (...args: any[]) => useDateFilterData(...args),
}));

jest.mock('../../../components/date-filter/hooks/useDateRangeContext', () => ({
  DateRange: ({ children }: any) => (
    <div data-testid='date-range'>{children}</div>
  ),
}));

jest.mock(
  '../../../components/date-filter/components/histogram-section',
  () => ({
    HistogramSection: ({ hasData }: any) => (
      <div>histogram-{String(hasData)}</div>
    ),
  }),
);

jest.mock('../../../components/date-filter/components/date-controls', () => ({
  DateControls: () => <div>date-controls</div>,
}));

describe('filters/components/date-filter/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDateFilterData.mockReturnValue({
      selectedData: [{ term: '2021-01-01', label: '2021', count: 2 }],
      resourcesWithNoDate: [{ term: '-_exists_', label: 'No', count: 4 }],
      hasAnyDateData: true,
    });
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it('renders histogram and controls when no error', () => {
    // Initial aggregation query (without date filter)
    useAggregation
      .mockReturnValueOnce({
        data: {
          total: 5,
          facets: {
            date: {
              terms: [{ term: '2020-01-01', count: 3 }],
              missing: 4,
              total: 3,
            },
          },
        },
        isPending: false,
        isFetching: false,
        error: null,
      })
      // Updated aggregation query (with date filter) - shared cache
      .mockReturnValueOnce({
        data: {
          total: 5,
          facets: {
            date: {
              terms: [{ term: '2021-01-01', count: 2 }],
              missing: 1,
              total: 2,
            },
          },
        },
        isPending: false,
        isFetching: false,
        error: null,
      });

    renderWithQueryClient(
      <DateFilter
        colorScheme='secondary'
        queryParams={{ q: 'abc', extra_filter: '(date:("2020"))' } as any}
        selectedDates={['2021-01-01', '2021-12-31']}
        handleSelectedFilter={jest.fn()}
        resetFilter={jest.fn()}
        enabled
        updatedAggregateQueryData={{
          results: {
            date: {
              terms: [{ term: '2021-01-01', count: 2 }],
              missing: 1,
              total: 2,
            },
          },
          isLoading: false,
          isUpdating: false,
          error: null,
        }}
      />,
    );

    expect(screen.getByTestId('date-range')).toBeInTheDocument();
    expect(screen.getByText('histogram-true')).toBeInTheDocument();
    expect(screen.getByText('date-controls')).toBeInTheDocument();
  });

  it('renders error state from update query', () => {
    useDateFilterData.mockReturnValue({
      selectedData: [],
      resourcesWithNoDate: [],
      hasAnyDateData: false,
    });

    useAggregation
      .mockReturnValueOnce({
        data: undefined,
        isPending: false,
        isFetching: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isPending: false,
        isFetching: false,
        error: new Error('boom'),
      });

    renderWithQueryClient(
      <DateFilter
        colorScheme='secondary'
        queryParams={{ q: 'abc', extra_filter: '' } as any}
        selectedDates={[]}
        handleSelectedFilter={jest.fn()}
        resetFilter={jest.fn()}
        enabled
        updatedAggregateQueryData={{
          results: undefined,
          isLoading: false,
          isUpdating: false,
          error: new Error('boom'),
        }}
      />,
    );

    expect(
      screen.getByText(/something went wrong, unable to load filters/i),
    ).toBeInTheDocument();
  });
});
