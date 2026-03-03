import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Histogram from '../../../../components/date-filter/components/histogram';

const useDateRangeContext = jest.fn();

jest.mock(
  '../../../../components/date-filter/hooks/useDateRangeContext',
  () => ({
    useDateRangeContext: () => useDateRangeContext(),
  }),
);

jest.mock('../../../../components/date-filter/components/date-brush', () => ({
  DateBrush: () => <div data-testid='date-brush' />,
}));

jest.mock('@visx/group', () => ({
  Group: ({ children }: any) => <g>{children}</g>,
}));
jest.mock('@visx/shape', () => ({
  Bar: ({ className, onClick, onMouseOver, onMouseOut }: any) => (
    <rect
      data-testid={className || 'bar'}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  ),
}));
jest.mock('@visx/axis', () => ({
  AxisBottom: () => <g data-testid='x-axis' />,
}));
jest.mock('@visx/responsive', () => ({
  useParentSize: () => ({ parentRef: jest.fn(), height: 120 }),
}));
jest.mock('@visx/tooltip', () => ({
  useTooltip: () => ({
    tooltipData: null,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipOpen: false,
    showTooltip: jest.fn(),
    hideTooltip: jest.fn(),
  }),
  useTooltipInPortal: () => ({
    containerRef: jest.fn(),
    containerBounds: { width: 400, left: 0, top: 0 },
    TooltipInPortal: ({ children }: any) => <div>{children}</div>,
  }),
  defaultStyles: {},
}));

describe('histogram', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows no-date-info fallback when allData is empty', () => {
    useDateRangeContext.mockReturnValue({
      filteredData: [],
      dates: [null, null],
      allData: [],
    });

    render(<Histogram updatedData={[]} handleClick={jest.fn()} />);
    expect(
      screen.getByText(/no results with date information/i),
    ).toBeInTheDocument();
  });

  it('renders bars and handles click selection', () => {
    const handleClick = jest.fn();
    useDateRangeContext.mockReturnValue({
      filteredData: [
        { term: '2020-01-01', label: '2020', count: 3 },
        { term: '2021-01-01', label: '2021', count: 1 },
      ],
      dates: ['2020-01-01', '2021-12-31'],
      allData: [
        { term: '2020-01-01', label: '2020', count: 3 },
        { term: '2021-01-01', label: '2021', count: 1 },
      ],
    });

    render(
      <Histogram
        updatedData={[
          { term: '2020-01-01', label: '2020', count: 3 },
          { term: '2021-01-01', label: '2021', count: 1 },
        ]}
        handleClick={handleClick}
      />,
    );

    expect(screen.getByTestId('date-brush')).toBeInTheDocument();
    const hoverBars = screen.getAllByTestId('hover-bar');
    fireEvent.click(hoverBars[0]);
    expect(handleClick).toHaveBeenCalledWith(['2020-01-01', '2020-12-31']);
  });
});
