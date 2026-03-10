import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateBrush } from '../../../../components/date-filter/components/date-brush';

const useDateRangeContext = jest.fn();

jest.mock(
  '../../../../components/date-filter/hooks/useDateRangeContext',
  () => ({
    useDateRangeContext: () => useDateRangeContext(),
  }),
);

jest.mock('src/components/brush/hooks/useBrushKeyboardNavigation', () => ({
  useBrushKeyboardNavigation: () => ({
    activeHandle: null,
    isKeyboardNavigating: false,
  }),
}));

jest.mock('src/components/brush/components/brush-handle', () => ({
  BrushHandle: () => <g data-testid='brush-handle' />,
}));

jest.mock('@visx/group', () => ({
  Group: ({ children }: any) => <g>{children}</g>,
}));
jest.mock('@visx/axis', () => ({
  AxisBottom: () => <g data-testid='axis-bottom' />,
}));
jest.mock('@visx/scale', () => {
  const createScale = ({ domain, range }: any) => {
    const fn: any = (value: any) => {
      const idx = domain.indexOf(value);
      if (idx < 0) return undefined;
      const step = (range[1] - range[0]) / Math.max(domain.length, 1);
      return range[0] + idx * step;
    };
    fn.bandwidth = () => 10;
    return fn;
  };
  return { scaleBand: createScale };
});
jest.mock('@visx/brush', () => ({
  Brush: ({ renderBrushHandle }: any) => (
    <g data-testid='brush'>
      {renderBrushHandle({ className: 'left' })}
      {renderBrushHandle({ className: 'right' })}
    </g>
  ),
}));

describe('date-brush', () => {
  it('returns null when no date data exists', () => {
    useDateRangeContext.mockReturnValue({
      allData: [],
      dateRange: [],
      setDateRange: jest.fn(),
      onBrushChangeEnd: null,
      setIsDragging: jest.fn(),
    });
    const { container } = render(<DateBrush containerWidth={300} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders brush and axis when data and range are present', () => {
    useDateRangeContext.mockReturnValue({
      allData: [
        { term: '2020-01-01', label: '2020', count: 1 },
        { term: '2021-01-01', label: '2021', count: 2 },
      ],
      dateRange: [0, 1],
      setDateRange: jest.fn(),
      onBrushChangeEnd: jest.fn(),
      setIsDragging: jest.fn(),
    });

    render(<DateBrush containerWidth={400} />);
    expect(screen.getByTestId('brush')).toBeInTheDocument();
    expect(screen.getByTestId('axis-bottom')).toBeInTheDocument();
  });
});
