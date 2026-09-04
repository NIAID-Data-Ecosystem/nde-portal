import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCarouselState } from '../hooks/useCarouselState';

// Mock Chakra UI's useMediaQuery hook
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: jest.fn(),
}));

// Mock the theme import with non-overlapping breakpoints
jest.mock('src/theme', () => ({
  theme: {
    breakpoints: {
      base: '0px',
      sm: '480px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
    },
  },
}));

describe('useCarouselState', () => {
  const mockChildren = [
    React.createElement('div', { key: '1' }, 'Item 1'),
    React.createElement('div', { key: '2' }, 'Item 2'),
    React.createElement('div', { key: '3' }, 'Item 3'),
    React.createElement('div', { key: '4' }, 'Item 4'),
    React.createElement('div', { key: '5' }, 'Item 5'),
  ];

  const defaultProps = {
    children: mockChildren,
    width: 800,
    gap: 32,
  };

  // Mock media queries for different screen sizes with non-overlapping ranges
  const mockMediaQueries = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
    const { useMediaQuery } = require('@chakra-ui/react');

    switch (screenSize) {
      case 'mobile':
        // Mobile: 0px to 767px (below md breakpoint) - constraint: 1
        (useMediaQuery as jest.Mock)
          .mockReturnValueOnce([true]) // isBetweenBaseAndMd: (max-width: 767px)
          .mockReturnValueOnce([false]) // isBetweenMdAndXl: (min-width: 768px) and (max-width: 1279px)
          .mockReturnValueOnce([false]); // isGreaterThanXL: (min-width: 1280px)
        break;

      case 'tablet':
        // Tablet: 768px to 1279px - constraint: 2
        (useMediaQuery as jest.Mock)
          .mockReturnValueOnce([false])
          .mockReturnValueOnce([true])
          .mockReturnValueOnce([false]);
        break;

      case 'desktop':
        // Desktop: 1280px and above - constraint: 3
        (useMediaQuery as jest.Mock)
          .mockReturnValueOnce([false])
          .mockReturnValueOnce([false])
          .mockReturnValueOnce([true]);
        break;
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default media query behavior (no breakpoint matched)
    const { useMediaQuery } = require('@chakra-ui/react');
    (useMediaQuery as jest.Mock).mockReturnValue([false]);
  });

  it('should return initial state values correctly', () => {
    mockMediaQueries('tablet');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    expect(result.current).toHaveProperty('itemWidth');
    expect(result.current).toHaveProperty('activeItem');
    expect(result.current).toHaveProperty('setActiveItem');
    expect(result.current).toHaveProperty('trackIsActive');
    expect(result.current).toHaveProperty('setTrackIsActive');
    expect(result.current).toHaveProperty('constraint');
    expect(result.current).toHaveProperty('controlsWidth');
    expect(result.current).toHaveProperty('showProgressBar');
    expect(result.current).toHaveProperty('positions');
    expect(result.current).toHaveProperty('maxActiveItem');
    expect(result.current).toHaveProperty('totalDots');
    expect(result.current).toHaveProperty('progressPercentage');

    // Verify initial state values
    expect(result.current.activeItem).toBe(0);
    expect(result.current.trackIsActive).toBe(false);
    expect(result.current.progressPercentage).toBe(0);
  });

  it('should configure mobile layout correctly (constraint: 1)', () => {
    mockMediaQueries('mobile');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    // Mobile should show 1 item at a time
    expect(result.current.constraint).toBe(1);
    // Item width should be container width minus gap
    expect(result.current.itemWidth).toBe(800 - 32); // 768px
    // maxActiveItem = 5 items - 1 (constraint) = 4
    expect(result.current.maxActiveItem).toBe(4);
    // Total dots should be 5 (one for each item)
    expect(result.current.totalDots).toBe(5);
  });

  it('should configure tablet layout correctly (constraint: 2)', () => {
    mockMediaQueries('tablet');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    expect(result.current.constraint).toBe(2);
    expect(result.current.itemWidth).toBe(800 / 2 - 32);
    expect(result.current.maxActiveItem).toBe(3);
    expect(result.current.totalDots).toBe(3);
  });

  it('should configure desktop layout correctly (constraint: 3)', () => {
    mockMediaQueries('desktop');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    expect(result.current.constraint).toBe(3);
    expect(result.current.itemWidth).toBe(800 / 3 - 32);
    expect(result.current.maxActiveItem).toBe(2);
    expect(result.current.totalDots).toBe(2);
  });

  it('should limit desktop constraint to 2 when there are fewer than 3 items', () => {
    mockMediaQueries('desktop');

    // Test with only 2 children
    const propsWithFewItems = {
      ...defaultProps,
      children: [
        React.createElement('div', { key: '1' }, 'Item 1'),
        React.createElement('div', { key: '2' }, 'Item 2'),
      ],
    };

    const { result } = renderHook(() => useCarouselState(propsWithFewItems));

    expect(result.current.constraint).toBe(2);
    expect(result.current.itemWidth).toBe(368);
    expect(result.current.maxActiveItem).toBe(0);
  });

  it('should calculate item positions correctly', () => {
    mockMediaQueries('tablet');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    const itemWidth = result.current.itemWidth;
    const itemWidthPlusGap = itemWidth + 32;

    expect(result.current.positions[0]).toBe(-Math.abs(itemWidthPlusGap * 0));
    expect(result.current.positions[1]).toBe(-Math.abs(itemWidthPlusGap * 1));
    expect(result.current.positions[2]).toBe(-Math.abs(itemWidthPlusGap * 2));
    expect(result.current.positions[3]).toBe(-Math.abs(itemWidthPlusGap * 3));
    expect(result.current.positions[4]).toBe(-Math.abs(itemWidthPlusGap * 4));
  });

  it('should recalculate positions when layout changes', () => {
    mockMediaQueries('mobile');

    const { result, rerender } = renderHook(() =>
      useCarouselState(defaultProps),
    );

    const initialPositions = result.current.positions;
    const initialItemWidth = result.current.itemWidth;

    // Switch to tablet layout to change itemWidth
    jest.clearAllMocks();
    mockMediaQueries('tablet');

    rerender();

    // Verify positions changed due to itemWidth change
    expect(result.current.positions).not.toEqual(initialPositions);
    expect(result.current.itemWidth).not.toBe(initialItemWidth);

    // Verify positions are calculated correctly with the current itemWidth
    const currentItemWidth = result.current.itemWidth;
    const expectedPositions = mockChildren.map(
      (_, index) => -Math.abs((currentItemWidth + 32) * index),
    );

    expectedPositions.forEach((expectedPos, index) => {
      expect(result.current.positions[index]).toBe(expectedPos);
    });
  });

  it('should allow updating active item through setter', () => {
    mockMediaQueries('tablet');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    // Initial active item should be 0
    expect(result.current.activeItem).toBe(0);

    // Update active item
    act(() => {
      result.current.setActiveItem(2);
    });

    // Active item should be updated
    expect(result.current.activeItem).toBe(2);
  });

  it('should calculate progress percentage correctly', () => {
    mockMediaQueries('tablet');

    const { result } = renderHook(() => useCarouselState(defaultProps));

    // Initial progress should be 0% (at start)
    expect(result.current.progressPercentage).toBe(0);

    // Move to middle position
    act(() => {
      result.current.setActiveItem(1); // Move to index 1
    });

    // Progress calculation: (1 / 3) * 100 ≈ 33.33%
    // maxActiveItem for 5 items with constraint 2 is 3
    expect(result.current.progressPercentage).toBeCloseTo(33.33, 1);

    // Move to end
    act(() => {
      result.current.setActiveItem(3);
    });

    // Progress should be 100% at the end
    expect(result.current.progressPercentage).toBe(100);
  });

  it('should show progress bar when thresholds are exceeded', () => {
    mockMediaQueries('mobile'); // constraint: 1

    // Create enough items to exceed SINGLE_ITEM threshold (10)
    const manyChildren = Array.from({ length: 12 }, (_, i) =>
      React.createElement('div', { key: i }, `Item ${i + 1}`),
    );

    const propsWithManyItems = {
      ...defaultProps,
      children: manyChildren,
    };

    const { result } = renderHook(() => useCarouselState(propsWithManyItems));

    // Should show progress bar as totalDots (12) > SINGLE_ITEM threshold (10)
    expect(result.current.totalDots).toBe(12);
    expect(result.current.showProgressBar).toBe(true);
  });

  it('should force progress bar when available width is below minimum', () => {
    mockMediaQueries('tablet');

    // Use very narrow width (below MIN_WIDTH threshold of 300)
    const propsWithNarrowWidth = {
      ...defaultProps,
      width: 250,
    };

    const { result } = renderHook(() => useCarouselState(propsWithNarrowWidth));

    // Should show progress bar since width < MIN_WIDTH
    expect(result.current.showProgressBar).toBe(true);
  });

  it('should update values when screen size changes', () => {
    mockMediaQueries('tablet');

    const { result, rerender } = renderHook(() =>
      useCarouselState(defaultProps),
    );

    const initialItemWidth = result.current.itemWidth;
    expect(initialItemWidth).toBe(800 / 2 - 32); // 368

    // Switch to mobile layout to trigger recalculation
    jest.clearAllMocks();
    mockMediaQueries('mobile');

    rerender();

    const newItemWidth = result.current.itemWidth;

    // Verify the itemWidth was recalculated
    expect(newItemWidth).toBe(800 - 32); // 768
    expect(newItemWidth).not.toBe(initialItemWidth);
  });

  it('should handle edge cases with empty or single children', () => {
    mockMediaQueries('mobile');

    // Test with single child
    const propsWithSingleChild = {
      ...defaultProps,
      children: [React.createElement('div', { key: '1' }, 'Only Item')],
    };

    const { result } = renderHook(() => useCarouselState(propsWithSingleChild));

    // Single item configuration
    expect(result.current.constraint).toBe(1);
    expect(result.current.maxActiveItem).toBe(0);
    expect(result.current.totalDots).toBe(1);
    expect(result.current.progressPercentage).toBe(0);

    // Test with empty children
    const propsWithNoChildren = {
      ...defaultProps,
      children: [],
    };

    const { result: emptyResult } = renderHook(() =>
      useCarouselState(propsWithNoChildren),
    );

    // Empty children configuration
    expect(emptyResult.current.maxActiveItem).toBeGreaterThanOrEqual(0);
    expect(emptyResult.current.totalDots).toBe(1);
  });
});
