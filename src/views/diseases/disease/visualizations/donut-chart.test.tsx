import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DonutChart, DonutChartProps } from './donut-chart';
import '@testing-library/jest-dom';

const mockData = [
  { term: 'Dataset', count: 100 },
  { term: 'Image', count: 50 },
  { term: 'Video', count: 25 },
];

const mockGetFillColor = (term: string) => {
  switch (term) {
    case 'Dataset':
      return 'blue';
    case 'Image':
      return 'green';
    case 'Video':
      return 'red';
    default:
      return 'gray';
  }
};

const mockGetRoute = (term: string) => ({ pathname: `/route/${term}` });

const defaultProps: DonutChartProps = {
  data: mockData,
  getFillColor: mockGetFillColor,
  getRoute: mockGetRoute,
  title: 'An accessible title',
  description: 'Followed by an accessible description.',
  handleGATracking: jest.fn(),
};

describe('DonutChart', () => {
  it('renders the chart with default dimensions', () => {
    render(<DonutChart {...defaultProps} />);
    const svgElement = screen.getByRole('img', { hidden: true });
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '400');
    expect(svgElement).toHaveAttribute('height', '400');
  });

  test('renders SVG with title and description for accessibility', () => {
    render(<DonutChart {...defaultProps} />);

    const svg = screen.getByRole('img');

    // Check that aria-labelledby is present
    expect(svg).toHaveAttribute('aria-labelledby');

    const labelledBy = svg.getAttribute('aria-labelledby');
    const ids = labelledBy?.split(' ') ?? [];

    for (const id of ids) {
      const element = document.getElementById(id);
      expect(element).toBeInTheDocument();
      if (id.includes('title')) {
        expect(element?.tagName.toLowerCase()).toBe('p');
      } else if (id.includes('desc')) {
        expect(element?.tagName.toLowerCase()).toBe('p');
      }
    }
  });

  it('renders the correct number of slices', () => {
    render(<DonutChart {...defaultProps} />);
    const slices = screen.getAllByRole('link');
    expect(slices).toHaveLength(mockData.length);
  });

  it('applies the correct fill colors to slices', () => {
    render(<DonutChart {...defaultProps} />);
    const slices = screen.getAllByRole('link');
    slices.forEach((slice, index) => {
      expect(slice.firstChild).toHaveAttribute(
        'fill',
        mockGetFillColor(mockData[index].term),
      );
    });
  });

  it('toggles logarithmic scaling when the checkbox is clicked', () => {
    render(<DonutChart {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox', { name: /apply log scale/i });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('links to the route a slice is clicked', () => {
    render(<DonutChart {...defaultProps} />);
    const slices = screen.getAllByRole('link');
    fireEvent.click(slices[0]);
    const link = slices[0].getAttribute('href');
    expect(link).toBe(mockGetRoute(mockData[0].term).pathname);
  });

  it('displays tooltip on mouse over a slice', () => {
    render(<DonutChart {...defaultProps} />);
    const slice = screen.getByTestId(`${mockData[0].term}-path`);
    // Simulate mouse over on the first slice
    fireEvent.pointerMove(slice);

    // Check if the tooltip is displayed
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(/dataset/i);
  });

  it('hides tooltip on mouse out from a slice', () => {
    render(<DonutChart {...defaultProps} />);
    const slice = screen.getByTestId(`${mockData[0].term}-path`);

    // Simulate mouse over and then mouse out on the first slice
    fireEvent.pointerMove(slice);
    fireEvent.mouseOut(slice);

    // Check if the tooltip is hidden
    const tooltip = screen.queryByTestId('tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('displays tooltip on slice focus', () => {
    render(<DonutChart {...defaultProps} />);
    const slice = screen.getByTestId(`${mockData[0].term}-path`);
    // Simulate mouse over on the first slice
    fireEvent.focus(slice);

    // Check if the tooltip is displayed
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(/Dataset/i);
  });

  it('hides tooltip on slice blur', () => {
    render(<DonutChart {...defaultProps} />);
    const focusedSlice = screen.getByTestId(`${mockData[0].term}-path`);

    fireEvent.focus(focusedSlice);
    fireEvent.blur(focusedSlice);

    const tooltip = screen.queryByTestId('tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('hides tooltip on click', () => {
    render(<DonutChart {...defaultProps} />);
    const slice = screen.getByTestId(`${mockData[0].term}-path`);

    // Simulate mouse over and then click on the first slice
    fireEvent.pointerMove(slice);
    fireEvent.click(slice);

    // Check if the tooltip is hidden
    const tooltip = screen.queryByTestId('tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('updates slice opacity on hover', () => {
    const { container } = render(<DonutChart {...defaultProps} />);
    const allPaths = container.querySelectorAll('path');
    const hovered_id = `${mockData[0].term}-path`;
    const hovered_slice = screen.getByTestId(hovered_id);

    // Simulate mouse over and then mouse out on the first slice
    fireEvent.pointerMove(hovered_slice);

    allPaths.forEach(path => {
      const id = path.getAttribute('data-testid');
      if (id) {
        const isHovered = path.getAttribute('data-testid') === hovered_id;
        expect(path).toHaveStyle(`opacity: ${isHovered ? 1 : 0.5}`);
      }
    });
  });
});
