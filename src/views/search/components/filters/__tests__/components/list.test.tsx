import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FiltersList, groupTerms, sortTerms } from '../../components/list';

jest.mock('react-window', () => {
  const React = require('react');
  const VariableSizeList = ({ itemCount, children }: any) => (
    <div data-testid='virtual-list'>
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index}>{children({ index, style: {} })}</div>
      ))}
    </div>
  );
  return {
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
    colorScheme: 'primary',
    terms: [
      { term: 'a', label: 'Alpha', count: 1 },
      { term: '-_exists_', label: 'No', count: 2 },
      { term: 'z', label: 'Zulu', count: 0, groupBy: 'Group B' },
      { term: 'b', label: 'Beta', count: 3, groupBy: 'Group A' },
    ],
    searchPlaceholder: 'Search',
    selectedFilters: ['a'],
    handleSelectedFilters: jest.fn(),
    isLoading: false,
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
