import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FiltersSection } from '../../components/section';
import { ChakraProvider, useBreakpointValue } from '@chakra-ui/react';
import {
  FiltersContainer,
  FiltersContainerProps,
} from '../../components/container';

// Mock the useBreakpointValue hook  -- put in desktop mode
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useBreakpointValue: jest.fn(),
  };
});

// Mock Tooltip component
jest.mock('src/components/tooltip', () => ({
  __esModule: true,
  default: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <div>
      {children}
      <span role='tooltip'>{label}</span>
    </div>
  ),
}));

const renderComponent = (props: {
  containerProps: Omit<FiltersContainerProps, 'children'>;
  sections: {
    key: string;
    name: string;
    property: string;
    description: string;
    children: React.ReactNode;
  }[];
}) => {
  return render(
    <ChakraProvider>
      <FiltersContainer {...props.containerProps}>
        {props.sections.map(section => (
          <FiltersSection {...section} key={section.key} />
        ))}
      </FiltersContainer>
    </ChakraProvider>,
  );
};

describe('FiltersSection', () => {
  (useBreakpointValue as jest.Mock).mockImplementation(values => values.md);
  const sections = [
    {
      key: 'test_01',
      name: 'Test Filter 1',
      property: 'test_01',
      description: 'test 1 description',
      children: <div>Filter1 children</div>,
      createQueries: () => [],
    },
    {
      key: 'test_02',
      name: 'Test Filter 2',
      property: 'test_02',
      description: 'test 2 description',
      children: <div>Filter2 children</div>,
      createQueries: () => [],
    },
  ];
  const containerProps = {
    title: 'Test Container',
    error: null,
    filtersList: sections,
    selectedFilters: { ['test_01']: ['value1'] },
  };

  it('renders correctly', () => {
    renderComponent({
      containerProps: { ...containerProps, selectedFilters: {} },
      sections,
    });
    expect(screen.getByText('Test Filter 1')).toBeInTheDocument();
    expect(screen.queryByText('Filter1 children')).toBeNull();
  });

  it('expands and collapses on click', async () => {
    renderComponent({
      containerProps: { ...containerProps, selectedFilters: {} },
      sections,
    });
    const button = screen.getByRole('button', { name: /Test Filter 1/i });

    // Initially collapsed
    expect(screen.queryByText('Filter1 children')).toBeNull();

    fireEvent.click(button);

    // After click, it should be expanded
    await waitFor(() =>
      expect(screen.getByText('Filter1 children')).toBeVisible(),
    );

    fireEvent.click(button);

    // After another click, it should be collapsed
    await waitFor(() =>
      expect(screen.queryByText('Filter1 children')).toBeNull(),
    );
  });

  it('displays tooltip with correct description', async () => {
    renderComponent({
      containerProps: { ...containerProps, selectedFilters: {} },
      sections,
    });
    const button = screen.getByRole('button', { name: /Test Filter 1/i });

    fireEvent.mouseOver(button);

    await waitFor(() => {
      const tooltips = screen.getAllByRole('tooltip');
      const tooltip = tooltips.find(
        t => t.textContent === 'Test 1 description',
      );
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('renders correct icon based on expanded state', async () => {
    renderComponent({
      containerProps: { ...containerProps, selectedFilters: {} },
      sections,
    });
    const button = screen.getByRole('button', { name: /Test Filter 1/i });

    // Initially it should have the plus icon
    const plusIcon = within(button).getByTestId('plus-icon');
    expect(plusIcon).toBeInTheDocument();

    fireEvent.click(button);

    // After click, it should have the minus icon
    await waitFor(() => {
      const minusIcon = within(button).getByTestId('minus-icon');
      expect(minusIcon).toBeInTheDocument();
    });
  });
});
