import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FiltersContainer } from '../../components/container';

jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useBreakpointValue: jest.fn(),
  };
});

jest.mock('../../components/customize-filters-popover', () => ({
  CustomizeFiltersPopover: () => <div data-testid='customize-popover' />,
}));

const { useBreakpointValue } = jest.requireMock('@chakra-ui/react');

describe('refactored-filters/components/container', () => {
  const props = {
    title: 'Search Filters',
    selectedFilters: { foo: ['bar'] },
    removeAllFilters: jest.fn(),
    error: null,
    filtersList: [{ id: 'a', property: 'foo' }],
    children: <div>child-content</div>,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders desktop content and supports clear all', () => {
    useBreakpointValue.mockReturnValue('desktop');
    render(<FiltersContainer {...props} />);

    expect(screen.getByText('Search Filters')).toBeInTheDocument();
    expect(screen.getByText('child-content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(props.removeAllFilters).toHaveBeenCalled();
  });

  it('renders error state', () => {
    useBreakpointValue.mockReturnValue('desktop');
    render(<FiltersContainer {...props} error={new Error('x')} />);
    expect(
      screen.getByText(/something went wrong, unable to load filters/i),
    ).toBeInTheDocument();
  });

  it('renders mobile drawer trigger and opens content', () => {
    useBreakpointValue.mockReturnValue('mobile');
    render(<FiltersContainer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /search filters/i }));
    expect(screen.getByText('Submit and Close')).toBeInTheDocument();
  });
});
