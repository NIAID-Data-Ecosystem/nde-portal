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
});
