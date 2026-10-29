import React from 'react';
import { render, screen, within } from 'src/__tests__/utils/render';

import { BrushableListChart } from './index';

const data = [
  { term: 'hiv infectious disease', count: 4424 },
  { term: 'tuberculosis', count: 1757 },
  { term: 'cancer', count: 1330 },
];

const facet = {
  label: 'Health Condition',
  value: 'healthCondition.name',
  fill: '#ccc',
  colorPalette: {},
  tooltip: '',
};

describe('BrushableListChart', () => {
  // Regression: a bare `List.Item` (outside `List.Root`) threw and took the
  // whole disease page down, and `asChild` with two children dropped the count.
  it('renders each term as a list item with a search link and its count', () => {
    const getSearchRoute = jest.fn((term: string) => ({
      pathname: '/search',
      query: { q: term },
    }));
    render(
      <BrushableListChart
        data={data}
        facet={facet}
        getSearchRoute={getSearchRoute}
        handleGATracking={jest.fn()}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(data.length);

    data.forEach(({ term, count }, index) => {
      const item = within(items[index]);
      expect(item.getByRole('link', { name: term })).toHaveAttribute('href');
      expect(getSearchRoute).toHaveBeenCalledWith(term);
      expect(item.getByText(count.toLocaleString())).toBeInTheDocument();
    });
  });
});
