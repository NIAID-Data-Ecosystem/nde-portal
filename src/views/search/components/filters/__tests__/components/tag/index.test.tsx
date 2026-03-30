import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FilterTags } from '../../../components/tag';

const resetPagination = jest.fn();

jest.mock('src/views/search/context/pagination-context', () => ({
  usePaginationContext: () => ({ resetPagination }),
}));

jest.mock('src/views/search/components/search-results-header', () => ({
  SearchResultsHeading: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock('src/views/search/components/filters/utils/query-string', () => ({
  queryFilterObject2String: jest.fn(() => '(compiled-filter)'),
}));

describe('filters/components/tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const filtersConfig = [
    {
      id: 'topic',
      property: 'topic',
      name: 'Topic',
      description: '',
      category: 'Shared',
      queryType: 'facet',
    },
    {
      id: 'date',
      property: 'date',
      name: 'Date',
      description: '',
      category: 'Shared',
      queryType: 'histogram',
    },
  ] as any;

  it('renders nothing when there are no selected tags', () => {
    const { container } = render(
      <FilterTags
        filtersConfig={filtersConfig}
        selectedFilters={{}}
        handleRouteUpdate={jest.fn()}
        removeAllFilters={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders tags, clears all, and removes a single selected value', () => {
    const handleRouteUpdate = jest.fn();
    const removeAllFilters = jest.fn();
    render(
      <FilterTags
        filtersConfig={filtersConfig}
        selectedFilters={{
          topic: ['alpha'],
          date: ['2020-01-01', '2021-12-31'],
        }}
        handleRouteUpdate={handleRouteUpdate}
        removeAllFilters={removeAllFilters}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(resetPagination).toHaveBeenCalled();
    expect(removeAllFilters).toHaveBeenCalled();

    const closeButtons = screen.getAllByLabelText('close');
    fireEvent.click(closeButtons[0]);
    expect(handleRouteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ filters: '(compiled-filter)' }),
    );
  });
});
