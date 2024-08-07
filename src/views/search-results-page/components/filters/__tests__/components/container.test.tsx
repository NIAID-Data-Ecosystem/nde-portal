import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FiltersContainer } from '../../components/container';
import { FilterConfig } from 'src/views/search-results-page/components/filters/types';
import { ChakraProvider, useBreakpointValue } from '@chakra-ui/react';

// Mock data
const mockFiltersList: FilterConfig[] = [
  {
    name: 'Filter 1',
    description: '',
    property: 'filter1',
    isDefaultOpen: false,
    createQueries: () => {
      return [];
    },
  },
  {
    name: 'Filter 2',
    description: '',
    property: 'filter2',
    isDefaultOpen: true,
    createQueries: () => {
      return [];
    },
  },
];
const mockSelectedFilters = {
  filter1: ['value1'],
  filter2: [],
};

// Mock the useBreakpointValue hook  -- put in desktop mode
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useBreakpointValue: jest.fn(),
  };
});

const renderComponent = (props = {}) => {
  return render(
    <ChakraProvider>
      <FiltersContainer
        title='Test Filters'
        selectedFilters={mockSelectedFilters}
        filtersList={mockFiltersList}
        error={null}
        {...props}
      >
        <div>Filter children</div>
      </FiltersContainer>
    </ChakraProvider>,
  );
};

describe('FiltersContainer', () => {
  beforeEach(() => {
    // Mock window.innerWidth to simulate desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Set to a value that corresponds to the desktop breakpoint
    });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and removeAllFilters', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    renderComponent();
    expect(screen.getByText('Test Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.getByText('Filter children')).toBeInTheDocument();
  });

  it('renders correctly without title', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    renderComponent({ title: '' });
    expect(screen.queryByText('Test Filters')).not.toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.getByText('Filter children')).toBeInTheDocument();
  });

  it('renders correctly without removeAllFilters', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    renderComponent({ removeAllFilters: undefined });
    expect(screen.getByText('Test Filters')).toBeInTheDocument();
    expect(screen.queryByText('Clear All')).toBeDisabled();
    expect(screen.getByText('Filter children')).toBeInTheDocument();
  });

  it('does not render the drawer on desktop', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    renderComponent();
    expect(
      screen.queryByRole('button', { name: /filters/i }),
    ).not.toBeInTheDocument();
  });

  it('clears all filters', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    const mockRemoveAllFilters = jest.fn();
    renderComponent({ removeAllFilters: mockRemoveAllFilters });

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);
    expect(mockRemoveAllFilters).toHaveBeenCalled();
  });

  it('displays error message', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
    const mockError = new Error('Test error');
    renderComponent({ error: mockError });

    expect(
      screen.getByText(/something went wrong, unable to load filters/i),
    ).toBeInTheDocument();
  });

  it('renders mobile version and opens drawer', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.base);
    renderComponent();
    const openButton = screen.getByRole('button', { name: /filters/i });
    expect(openButton).toBeInTheDocument();
    fireEvent.click(openButton);
    expect(screen.getByText('Submit and Close')).toBeInTheDocument();
  });

  it('renders tablet version and opens drawer', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => values.sm);
    renderComponent();
    const openButton = screen.getByRole('button', { name: /filters/i });
    expect(openButton).toBeInTheDocument();
    fireEvent.click(openButton);
    expect(screen.getByText('Submit and Close')).toBeInTheDocument();
  });

  it('initializes innerHeight correctly', () => {
    (useBreakpointValue as jest.Mock).mockImplementation(values => undefined);

    // Set initial innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    renderComponent();
    // Check initial innerHeight value
    expect(
      screen.queryByRole('button', { name: /filters/i }),
    ).not.toBeInTheDocument(); // Assuming desktop view
  });

  it('updates innerHeight on window resize', () => {
    renderComponent();

    // Check initial innerHeight value
    expect(window.innerHeight).toBe(1024); // default value

    // Resize window
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800, // new value
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.queryByText('Submit and Close')).not.toBeInTheDocument(); //  desktop view
  });
});
