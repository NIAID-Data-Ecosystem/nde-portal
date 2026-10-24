import { renderHook, act } from '@testing-library/react';
import { useCarouselNavigation } from '../hooks/useCarouselNavigation';

describe('useCarouselNavigation', () => {
  // Set up some mock functions
  let mockSetActiveItem: jest.Mock;
  let mockSetTrackIsActive: jest.Mock;

  // Helper function to create default props with optional overrides
  const createDefaultProps = (overrides = {}) => ({
    setActiveItem: mockSetActiveItem,
    setTrackIsActive: mockSetTrackIsActive,
    constraint: 2,
    maxActiveItem: 10,
    ...overrides,
  });

  beforeEach(() => {
    mockSetActiveItem = jest.fn();
    mockSetTrackIsActive = jest.fn();
  });

  it('should return navigation functions', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(createDefaultProps()),
    );

    expect(result.current).toEqual({
      handleFocus: expect.any(Function),
      handleDecrementClick: expect.any(Function),
      handleIncrementClick: expect.any(Function),
      handleDotClick: expect.any(Function),
    });
  });

  it('should activate track when handleFocus is called', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(createDefaultProps()),
    );

    act(() => {
      result.current.handleFocus();
    });

    // Check that setTrackIsActive was called with true
    expect(mockSetTrackIsActive).toHaveBeenCalledWith(true);
    // Check that it was called exactly once
    expect(mockSetTrackIsActive).toHaveBeenCalledTimes(1);
    // setActiveItem should NOT have been called for focus
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('should handle decrement click correctly', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(createDefaultProps()),
    );

    act(() => {
      result.current.handleDecrementClick();
    });

    // When decrement is clicked:
    // a. Track should be activated
    expect(mockSetTrackIsActive).toHaveBeenCalledWith(true);
    // b. setActiveItem should be called with a function
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    // Get the function passed to setActiveItem
    const updateFunction = mockSetActiveItem.mock.calls[0][0];

    // Test the function with different values (using default constraint: 2)
    expect(updateFunction(4)).toBe(2);
    expect(updateFunction(1)).toBe(0);
    expect(updateFunction(0)).toBe(0);
  });

  it('should handle increment click correctly', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(
        createDefaultProps({
          constraint: 3,
          maxActiveItem: 15,
        }),
      ),
    );

    act(() => {
      result.current.handleIncrementClick();
    });

    expect(mockSetTrackIsActive).toHaveBeenCalledWith(true);
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    // Get the function passed to setActiveItem
    const updateFunction = mockSetActiveItem.mock.calls[0][0];

    expect(updateFunction(5)).toBe(8);
    expect(updateFunction(14)).toBe(15);
    expect(updateFunction(15)).toBe(15);
  });

  it('should handle dot click correctly', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(createDefaultProps()),
    );

    // Test clicking on dot index 2
    act(() => {
      result.current.handleDotClick(2);
    });

    // Dot click should calculate: index * constraint = 2 * 2 = 4 (using default constraint: 2)
    expect(mockSetActiveItem).toHaveBeenCalledWith(4);
  });

  it('should handle dot click at boundaries correctly', () => {
    const { result } = renderHook(() =>
      useCarouselNavigation(
        createDefaultProps({
          constraint: 3,
          maxActiveItem: 7,
        }),
      ),
    );

    // Test clicking a dot that would go beyond the maximum
    act(() => {
      result.current.handleDotClick(3); // 3 * 3 = 9, but max is 7
    });

    expect(mockSetActiveItem).toHaveBeenCalledWith(7);
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() =>
      useCarouselNavigation(createDefaultProps()),
    );

    // Get the functions from the first render
    const firstRenderFunctions = result.current;

    // Force a re-render with the same props
    rerender();

    // Get the functions from the second render
    const secondRenderFunctions = result.current;

    // Function references should be the same
    expect(firstRenderFunctions.handleFocus).toBe(
      secondRenderFunctions.handleFocus,
    );
    expect(firstRenderFunctions.handleDecrementClick).toBe(
      secondRenderFunctions.handleDecrementClick,
    );
    expect(firstRenderFunctions.handleIncrementClick).toBe(
      secondRenderFunctions.handleIncrementClick,
    );
    expect(firstRenderFunctions.handleDotClick).toBe(
      secondRenderFunctions.handleDotClick,
    );
  });

  it('should update functions when dependencies change', () => {
    let constraint = 2;
    let maxActiveItem = 10;

    // Create a renderHook setup
    const { result, rerender } = renderHook(() =>
      useCarouselNavigation({
        setActiveItem: mockSetActiveItem,
        setTrackIsActive: mockSetTrackIsActive,
        constraint,
        maxActiveItem,
      }),
    );

    // Test with initial values
    act(() => {
      result.current.handleIncrementClick();
    });

    const firstUpdateFunction = mockSetActiveItem.mock.calls[0][0];
    expect(firstUpdateFunction(0)).toBe(2);

    // Clear mock calls
    mockSetActiveItem.mockClear();

    // Change props and re-render
    constraint = 5;
    maxActiveItem = 20;
    rerender();

    // Test with new values
    act(() => {
      result.current.handleIncrementClick();
    });

    const secondUpdateFunction = mockSetActiveItem.mock.calls[0][0];
    expect(secondUpdateFunction(0)).toBe(5);
  });
});
