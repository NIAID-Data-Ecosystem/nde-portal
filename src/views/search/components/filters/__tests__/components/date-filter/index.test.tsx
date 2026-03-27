import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateFilter } from '../../../components/date-filter';

const useFilterQueries = jest.fn();
const useDateFilterData = jest.fn();

jest.mock('../../../hooks/useFilterQueries', () => ({
  useFilterQueries: (...args: any[]) => useFilterQueries(...args),
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

  it('renders histogram and controls when no error', () => {
    useFilterQueries
      .mockReturnValueOnce({
        results: {
          date: { data: [{ term: '2020-01-01', count: 1, label: '2020' }] },
        },
        isLoading: false,
      })
      .mockReturnValueOnce({
        results: {
          date: { data: [{ term: '2021-01-01', count: 2, label: '2021' }] },
        },
        isLoading: false,
        isUpdating: false,
        error: null,
      });

    render(
      <DateFilter
        colorScheme='secondary'
        queryParams={{ q: 'abc', extra_filter: '(date:("2020"))' } as any}
        selectedDates={['2021-01-01', '2021-12-31']}
        handleSelectedFilter={jest.fn()}
        resetFilter={jest.fn()}
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

    useFilterQueries
      .mockReturnValueOnce({
        results: { date: { data: [] } },
        isLoading: false,
      })
      .mockReturnValueOnce({
        results: { date: { data: [] } },
        isLoading: false,
        isUpdating: false,
        error: new Error('boom'),
      });

    render(
      <DateFilter
        colorScheme='secondary'
        queryParams={{ q: 'abc', extra_filter: '' } as any}
        selectedDates={[]}
        handleSelectedFilter={jest.fn()}
        resetFilter={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/something went wrong, unable to load filters/i),
    ).toBeInTheDocument();
  });
});
