import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';

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

describe('filters/components/container', () => {
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

    expect(screen.getByTestId('customize-popover')).toBeInTheDocument();
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

  it('renders mobile drawer trigger and opens content', async () => {
    useBreakpointValue.mockReturnValue('mobile');
    render(<FiltersContainer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /search filters/i }));
    // v3's Drawer mounts its portalled content through zag's presence machine,
    // so the footer is not in the DOM synchronously after the click.
    expect(await screen.findByText('Done')).toBeInTheDocument();
  });
});
