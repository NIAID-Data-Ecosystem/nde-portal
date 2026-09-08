import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import router from 'next-router-mock';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { CollectionSizeHistogram } from '.';

jest.mock('next/router', () => require('next-router-mock'));

const resetPagination = jest.fn();
jest.mock('src/views/search/context/pagination-context', () => ({
  usePaginationContext: () => ({ resetPagination }),
}));

// visx's portal tooltip measures the DOM, which jsdom cannot do; the bars and
// their handlers are what these tests exercise.
jest.mock('@visx/tooltip', () => ({
  ...jest.requireActual('@visx/tooltip'),
  useTooltipInPortal: () => ({
    containerRef: () => {},
    containerBounds: { left: 0, top: 0, width: 400 },
    TooltipInPortal: () => null,
  }),
}));

jest.mock('@visx/responsive', () => ({
  ...jest.requireActual('@visx/responsive'),
  useParentSize: () => ({ parentRef: () => {}, width: 400, height: 200 }),
}));

const DATA: ChartDatum[] = [
  {
    id: '0-9',
    term: '0-9',
    value: 600,
    label: '0',
    tooltip: '0 - 9: 600 results',
  },
  {
    id: '1000-9999',
    term: '1000-9999',
    value: 20,
    label: '1K',
    tooltip: '1,000 - 9,999: 20 results',
  },
  {
    id: '10000000-*',
    term: '10000000-*',
    value: 3,
    label: '10M',
    tooltip: '>= 10,000,000: 3 results',
  },
];

const bar = (name: RegExp) => screen.getByRole('button', { name });

const appliedFilters = () => {
  const filters = router.query.filters;
  return Array.isArray(filters) ? filters.join('') : filters || '';
};

describe('CollectionSizeHistogram', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    router.setCurrentUrl('/search?q=__all__');
  });

  it('renders one clickable bar per bucket with its range and count', () => {
    render(<CollectionSizeHistogram data={DATA} />);

    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(bar(/0 - 9: 600 results/)).toBeInTheDocument();
    expect(bar(/>= 10,000,000: 3 results/)).toBeInTheDocument();
  });

  it('applies the bucket range when a bar is clicked', () => {
    render(<CollectionSizeHistogram data={DATA} />);

    fireEvent.click(bar(/1,000 - 9,999/));

    expect(appliedFilters()).toContain(
      'collectionSize.minValue:[1000 TO 9999]',
    );
    expect(resetPagination).toHaveBeenCalled();
  });

  // The open-ended bucket has no upper bound, which serializes as `*`.
  it('applies an open-ended range for the final bucket', () => {
    render(<CollectionSizeHistogram data={DATA} />);

    fireEvent.click(bar(/>= 10,000,000/));

    expect(appliedFilters()).toContain(
      'collectionSize.minValue:[10000000 TO *]',
    );
  });

  // Merging the current filters is what keeps the unit selection alive.
  it('preserves the selected unit', () => {
    router.setCurrentUrl(
      '/search?q=__all__&filters=(collectionSize.unitText:("Genomes"))',
    );
    render(<CollectionSizeHistogram data={DATA} />);

    fireEvent.click(bar(/1,000 - 9,999/));

    const filters = appliedFilters();
    expect(filters).toContain('collectionSize.unitText:("Genomes")');
    expect(filters).toContain('collectionSize.minValue:[1000 TO 9999]');
  });

  it('clears the range when the applied bucket is clicked again', () => {
    router.setCurrentUrl(
      '/search?q=__all__&filters=(collectionSize.minValue:[1000 TO 9999])',
    );
    render(<CollectionSizeHistogram data={DATA} />);

    fireEvent.click(bar(/1,000 - 9,999/));

    expect(appliedFilters()).not.toContain('collectionSize.minValue');
  });

  it('marks the buckets the applied range covers', () => {
    router.setCurrentUrl(
      '/search?q=__all__&filters=(collectionSize.minValue:[1000 TO 9999])',
    );
    render(<CollectionSizeHistogram data={DATA} />);

    expect(bar(/1,000 - 9,999/)).toHaveAttribute('aria-pressed', 'true');
    expect(bar(/^0 - 9:/)).toHaveAttribute('aria-pressed', 'false');
    // A bar's label states which way the click goes.
    expect(bar(/1,000 - 9,999/).getAttribute('aria-label')).toContain('Remove');
    expect(bar(/^0 - 9:/).getAttribute('aria-label')).toContain('Apply');
  });

  // A partial range still belongs to the decade it sits in.
  it('marks a bucket a partial range overlaps', () => {
    router.setCurrentUrl(
      '/search?q=__all__&filters=(collectionSize.minValue:[1500 TO 3000])',
    );
    render(<CollectionSizeHistogram data={DATA} />);

    expect(bar(/1,000 - 9,999/)).toHaveAttribute('aria-pressed', 'true');
    expect(bar(/^0 - 9:/)).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks every bucket an open-ended range reaches', () => {
    router.setCurrentUrl(
      '/search?q=__all__&filters=(collectionSize.minValue:[1000 TO *])',
    );
    render(<CollectionSizeHistogram data={DATA} />);

    expect(bar(/1,000 - 9,999/)).toHaveAttribute('aria-pressed', 'true');
    expect(bar(/>= 10,000,000/)).toHaveAttribute('aria-pressed', 'true');
    expect(bar(/^0 - 9:/)).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies a range from the keyboard', () => {
    render(<CollectionSizeHistogram data={DATA} />);

    const target = bar(/1,000 - 9,999/);
    target.focus();
    fireEvent.keyDown(target, { key: 'Enter' });

    expect(appliedFilters()).toContain(
      'collectionSize.minValue:[1000 TO 9999]',
    );
  });

  it('renders nothing without data', () => {
    render(<CollectionSizeHistogram data={[]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
