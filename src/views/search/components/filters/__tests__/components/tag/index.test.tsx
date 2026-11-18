import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';

import { FilterTags } from '../../../components/tag';

const resetPagination = jest.fn();

jest.mock('src/views/search/context/pagination-context', () => ({
  usePaginationContext: () => ({ resetPagination }),
}));

jest.mock('src/views/search/components/search-results-header', () => ({
  SearchResultsHeading: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock('src/views/search/components/filters/utils/query-string', () => ({
  ...jest.requireActual(
    'src/views/search/components/filters/utils/query-string',
  ),
  queryFilterObject2String: jest.fn(() => '(compiled-filter)'),
}));

const { queryFilterObject2String } = jest.requireMock(
  'src/views/search/components/filters/utils/query-string',
);

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

  it('renders and removes tags for an `_or` field outside the filter list', () => {
    const handleRouteUpdate = jest.fn();
    render(
      <FilterTags
        filtersConfig={filtersConfig}
        selectedFilters={{
          _or: [{ topic: ['alpha'] }, { topic: ['beta'], _id: ['dde_123'] }],
        }}
        handleRouteUpdate={handleRouteUpdate}
        removeAllFilters={jest.fn()}
      />,
    );

    expect(screen.getByText('ID: dde_123')).toBeInTheDocument();

    // Removing the `_id` drops the `_or` entry it's AND-ed into, flattening
    // the group back to a plain filter.
    // Tags render in order: "Topic: alpha", "Topic: beta", "ID: dde_123".
    fireEvent.click(screen.getAllByLabelText('close')[2]);
    expect(queryFilterObject2String).toHaveBeenLastCalledWith({
      topic: ['alpha'],
      _id: [],
    });
    expect(handleRouteUpdate).toHaveBeenCalled();
  });
});
