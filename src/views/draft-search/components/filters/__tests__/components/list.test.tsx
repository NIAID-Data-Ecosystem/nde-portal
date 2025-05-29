// FiltersList.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterConfig, FacetTermWithDetails, FilterItem } from '../../types';
import { FiltersList, groupTerms } from '../../components/list';

jest.mock('react-window', () => ({
  VariableSizeList: ({ children, itemCount }: any) => (
    <div>
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} style={{}}>
          {children({ index, style: {} })}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('src/components/search-input', () => ({
  SearchInput: jest.fn(({ value, handleChange, onClose, ...props }) => {
    return (
      <>
        <input
          data-testid='search-input'
          value={value}
          onChange={handleChange}
          {...props}
        />
        <button data-testid='close-button' onClick={onClose}>
          Clear
        </button>
      </>
    );
  }),
}));

const mockTerms: FilterItem[] = [
  { term: 'term1', label: 'Term 1', count: 5 },
  { term: 'term2', label: 'Term 2', count: 3 },
  { term: '-_exists_', label: 'Not', count: 1 },
];

describe('FiltersList', () => {
  const defaultProps = {
    colorScheme: 'blue',
    terms: mockTerms,
    searchPlaceholder: 'Search terms',
    selectedFilters: [],
    handleSelectedFilters: jest.fn(),
    isLoading: false,
    property: 'testProperty',
    config: { name: 'Test Config' } as FilterConfig,
  };

  it('renders without crashing', () => {
    render(<FiltersList {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search terms')).toBeInTheDocument();
  });

  it('resets search input on close button click', () => {
    render(<FiltersList {...defaultProps} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'term' } });

    // Verify that the search input value has been updated
    expect(searchInput).toHaveValue('term');

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    // Verify that the search input value has been reset
    expect(searchInput).toHaveValue('');
  });

  it('calls handleSelectedFilters when a filter is selected', () => {
    render(<FiltersList {...defaultProps} />);
    const checkbox = screen.getByDisplayValue('term1');
    fireEvent.click(checkbox);
    expect(defaultProps.handleSelectedFilters).toHaveBeenCalledWith(['term1']);
  });

  it('filters terms based on search input', async () => {
    render(<FiltersList {...defaultProps} />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'term 2' } });

    await waitFor(() => {
      expect(screen.queryByText('Term 1')).not.toBeInTheDocument();
      expect(screen.getByText('Term 2')).toBeInTheDocument();
    });
  });

  it('displays the correct number of filter terms', () => {
    render(<FiltersList {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(mockTerms.length);
  });

  it('displays headers correctly', () => {
    const termsWithHeader: FilterItem[] = [
      ...mockTerms,
      { term: 'header', label: 'Header', count: 0, isHeader: true },
    ];
    render(<FiltersList {...defaultProps} terms={termsWithHeader} />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(mockTerms.length); // Headers should not be counted
  });

  it('shows loading state correctly', () => {
    const { container } = render(<FiltersList {...defaultProps} isLoading />);
    // Use querySelectorAll to find elements with class containing "skeleton"
    const skeletonElements = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletonElements.length).toBe(3);
  });

  it('displays the correct term labels', () => {
    render(<FiltersList {...defaultProps} />);
    const term1Label = screen.getByText('Term 1');
    const term2Label = screen.getByText('Term 2');
    const not_exists = mockTerms.find(term => term.term === '-_exists_');

    const notSpecifiedLabel = screen.getByText(
      not_exists?.label + ' ' + defaultProps.config.name.toLowerCase(),
    );

    expect(term1Label).toBeInTheDocument();
    expect(term2Label).toBeInTheDocument();
    expect(notSpecifiedLabel).toBeInTheDocument();
  });

  it('groups and sorts terms correctly', () => {
    const terms: FilterItem[] = [
      { term: 'term1', label: 'A Term', count: 2 },
      { term: 'term2', label: 'B Term', count: 3 },
      { term: 'term3', label: 'Z Term', count: 1 },
    ];
    render(<FiltersList {...defaultProps} terms={terms} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('value', 'term2'); // B Term has the highest count
    expect(checkboxes[1]).toHaveAttribute('value', 'term1'); // A Term has a lower count
    expect(checkboxes[2]).toHaveAttribute('value', 'term3'); // Z Term has the lowest count
  });

  it('displays sub-labels correctly', () => {
    const termsWithSubLabels: FilterItem[] = [
      {
        term: 'term1|term2',
        label: 'Scientific | Common',
        count: 5,
        isHeader: false,
      },
    ];
    render(<FiltersList {...defaultProps} terms={termsWithSubLabels} />);
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Scientific')).toBeInTheDocument();
  });

  it('groups terms correctly', () => {
    const termsWithGrouping = [
      { term: 'term1', label: 'Term 1', count: 5, groupBy: 'Vegetables' },
      { term: 'term2', label: 'Term 2', count: 23, groupBy: 'Fruits' },
      { term: 'term3', label: 'Term 3', count: 25, groupBy: 'Vegetables' },
      { term: 'term4', label: 'Term 4', count: 23, groupBy: 'Fruits' },
      { term: 'term5', label: 'Term 5', count: 0, groupBy: 'Fruits' },
      { term: '-_exists_', label: 'Not', count: 1 },
    ];

    render(<FiltersList {...defaultProps} terms={termsWithGrouping} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('value', '-_exists_');
    // Show groups alphabetically by default (including a header for the group)
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(checkboxes[1]).toHaveAttribute('value', 'term2');
    expect(checkboxes[2]).toHaveAttribute('value', 'term4');
    expect(checkboxes[3]).toHaveAttribute('value', 'term5');

    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(checkboxes[4]).toHaveAttribute('value', 'term3');
    expect(checkboxes[5]).toHaveAttribute('value', 'term1');
  });

  it('_exists_ terms are ordered first', () => {
    const terms = [...mockTerms, { term: '_exists_', label: 'Any', count: 1 }];

    render(<FiltersList {...defaultProps} terms={terms} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('value', '-_exists_');
    expect(checkboxes[1]).toHaveAttribute('value', '_exists_');
  });

  it('handles empty terms gracefully', () => {
    render(<FiltersList {...defaultProps} terms={[]} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('handles undefined terms gracefully', () => {
    //@ts-ignore
    render(<FiltersList {...defaultProps} terms={undefined} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

describe('groupTerms', () => {
  const selectedFilters = ['selected1'];

  it('returns an empty array when terms are undefined', () => {
    //@ts-ignore
    const result = groupTerms(undefined, selectedFilters);
    expect(result).toEqual([]);
  });

  it('groups terms correctly with no groupOrder', () => {
    const terms: FacetTermWithDetails[] = [
      { term: 'term1', label: 'Term 1', count: 5 },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { term: 'term3', label: 'Term 3', count: 1, groupBy: 'Group 2' },
    ];

    const result = groupTerms(terms, selectedFilters);
    expect(result).toEqual([
      { label: 'Group 1', count: 1, term: 'Group 1', isHeader: true },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { label: 'Group 2', count: 1, term: 'Group 2', isHeader: true },
      { term: 'term3', label: 'Term 3', count: 1, groupBy: 'Group 2' },
      { term: 'term1', label: 'Term 1', count: 5 }, // ungrouped item has no header
    ]);
  });

  it('groups terms correctly with groupOrder', () => {
    const terms: FacetTermWithDetails[] = [
      { term: 'term1', label: 'Term 1', count: 5 },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { term: 'term3', label: 'Term 3', count: 1, groupBy: 'Group 2' },
    ];

    const groupOrder: FilterConfig['groupBy'] = [
      { property: 'Group 2', label: 'Custom Group 2 label' },
      { property: 'Group 1', label: 'Custom Group 1 label' },
    ];

    const result = groupTerms(terms, selectedFilters, groupOrder);
    expect(result).toEqual([
      {
        label: 'Custom Group 2 label',
        count: 1,
        term: 'Group 2',
        isHeader: true,
      },
      { term: 'term3', label: 'Term 3', count: 1, groupBy: 'Group 2' },
      {
        label: 'Custom Group 1 label',
        count: 1,
        term: 'Group 1',
        isHeader: true,
      },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { term: 'term1', label: 'Term 1', count: 5 },
    ]);
  });

  it('places _exists_ terms first', () => {
    const terms: FacetTermWithDetails[] = [
      { term: 'term1', label: 'Term 1', count: 5 },
      { term: '-_exists_', label: 'Not', count: 1 },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { term: '_exists_', label: 'Any', count: 2 },
    ];

    const result = groupTerms(terms, selectedFilters);
    expect(result).toEqual([
      { term: '-_exists_', label: 'Not', count: 1 },
      { term: '_exists_', label: 'Any', count: 2 },
      { label: 'Group 1', count: 1, term: 'Group 1', isHeader: true },
      { term: 'term2', label: 'Term 2', count: 3, groupBy: 'Group 1' },
      { term: 'term1', label: 'Term 1', count: 5 },
    ]);
  });

  it('places selected filters at the top', () => {
    const terms: FacetTermWithDetails[] = [
      { term: 'term1', label: 'Term 1', count: 1 },
      { term: 'term2', label: 'Term 2', count: 100 },
      { term: 'selected1', label: 'Selected Term 1', count: 2 },
    ];

    const result = groupTerms(terms, selectedFilters);
    expect(result).toEqual([
      { term: 'selected1', label: 'Selected Term 1', count: 2 },
      { term: 'term2', label: 'Term 2', count: 100 },
      { term: 'term1', label: 'Term 1', count: 1 },
    ]);
  });

  it('places selected filters right after _exists_', () => {
    const terms: FacetTermWithDetails[] = [
      { term: '-_exists_', label: 'Not', count: 1 },
      { term: '_exists_', label: 'Any', count: 2 },
      { term: 'term1', label: 'Term 1', count: 1 },
      { term: 'term2', label: 'Term 2', count: 100 },
      { term: 'selected1', label: 'Selected Term 1', count: 23 },
    ];

    const result = groupTerms(terms, selectedFilters);
    expect(result).toEqual([
      { term: '-_exists_', label: 'Not', count: 1 },
      { term: '_exists_', label: 'Any', count: 2 },
      { term: 'selected1', label: 'Selected Term 1', count: 23 },
      { term: 'term2', label: 'Term 2', count: 100 },
      { term: 'term1', label: 'Term 1', count: 1 },
    ]);
  });
  it('handles terms without groupBy or exists', () => {
    const terms: FacetTermWithDetails[] = [
      { term: 'term1', label: 'Term 1', count: 1 },
      { term: 'term2', label: 'Term 2', count: 3 },
    ];

    const result = groupTerms(terms, selectedFilters);
    expect(result).toEqual([
      { term: 'term2', label: 'Term 2', count: 3 },
      { term: 'term1', label: 'Term 1', count: 1 },
    ]);
  });
});
