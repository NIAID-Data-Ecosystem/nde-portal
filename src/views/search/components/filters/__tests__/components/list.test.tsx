import React from 'react';
import { fireEvent, render, screen, waitFor } from 'src/__tests__/utils/render';

import { FiltersList, groupTerms, sortTerms } from '../../components/list';

jest.mock('react-window', () => {
  const React = require('react');
  // Renders every row, but keeps react-window's contract: `children` is a row
  // component (rendered with createElement, so its identity decides whether
  // rows remount) that receives `itemData` as `data`.
  const VariableSizeList = ({ itemCount, itemData, children: Row }: any) => (
    <div data-testid='virtual-list'>
      {Array.from({ length: itemCount }, (_, index) => (
        <Row key={index} index={index} style={{}} data={itemData} />
      ))}
    </div>
  );
  return {
    ...jest.requireActual('react-window'),
    VariableSizeList: React.forwardRef((props: any, _ref: any) => (
      <VariableSizeList {...props} />
    )),
  };
});

jest.mock('src/components/search-input', () => ({
  SearchInput: ({ value, handleChange, onClose, placeholder }: any) => (
    <>
      <input
        data-testid='search-input'
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <button onClick={onClose}>clear</button>
    </>
  ),
}));

describe('filters/components/list', () => {
  const baseProps = {
    colorPalette: 'primary',
    terms: [
      { term: 'a', label: 'Alpha', count: 1 },
      { term: '-_exists_', label: 'No', count: 2 },
      { term: 'z', label: 'Zulu', count: 0, groupBy: 'Group B' },
      { term: 'b', label: 'Beta', count: 3, groupBy: 'Group A' },
    ],
    searchPlaceholder: 'Search',
    selectedFilters: ['a'],
    handleSelectedFilters: jest.fn(),
    loading: false,
    config: {
      id: 'x',
      name: 'Test Filter',
      property: 'x',
      category: 'Shared',
      queryType: 'facet',
      description: '',
      groupBy: [{ property: 'Group A', label: 'Group A Label' }],
    },
  } as any;

  it('renders no-results state when terms are empty and not loading', () => {
    render(<FiltersList {...baseProps} terms={[]} />);
    expect(
      screen.getByText(/no results with test filter information/i),
    ).toBeInTheDocument();
  });

  it('renders list and filters by search input', async () => {
    render(<FiltersList {...baseProps} />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'beta' },
    });

    await waitFor(() => {
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    });
  });

  it('keeps rows mounted when the list re-renders', () => {
    const { rerender } = render(<FiltersList {...baseProps} />);
    const row = screen.getByText('Beta').closest('.virtualized-row');

    // Same selection, new array: the list re-renders but nothing changed.
    rerender(
      <FiltersList
        {...baseProps}
        selectedFilters={[...baseProps.selectedFilters]}
      />,
    );

    expect(row).toBeInTheDocument();
    expect(screen.getByText('Beta').closest('.virtualized-row')).toBe(row);
  });

  it('sortTerms orders selected and exists terms first then by count', () => {
    const sorted = sortTerms(
      [
        { term: 'd', label: 'D', count: 1 },
        { term: '_exists_', label: 'Any', count: 1 },
        { term: '-_exists_', label: 'No', count: 1 },
        { term: 'a', label: 'A', count: 5 },
      ],
      ['d'],
    );

    expect(sorted.map(x => x.term)).toEqual([
      'd',
      '-_exists_',
      '_exists_',
      'a',
    ]);
  });

  it('groupTerms applies ordered groups, ungrouped fallback, and undefined guard', () => {
    expect(groupTerms(undefined as any, [])).toEqual([]);
    const grouped = groupTerms(baseProps.terms, [], baseProps.config.groupBy);
    expect(grouped.some(x => x.isHeader && x.label === 'Group A Label')).toBe(
      true,
    );
    expect(grouped.some(x => x.term === '-_exists_')).toBe(true);
  });
});
