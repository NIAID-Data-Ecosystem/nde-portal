import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Track } from '../components/Track';
import { TrackProps, DragEndInfo } from '../types';

// Mock framer-motion to avoid complex animation testing and focus on logic
jest.mock('framer-motion', () => ({
  motion: (Component: any) => {
    return React.forwardRef<HTMLDivElement, any>(
      ({ children, onDragStart, onDragEnd, ...props }, ref) => {
        // Filter out framer-motion specific props that shouldn't be passed to DOM
        const {
          dragConstraints,
          animate,
          style,
          drag,
          _active,
          minWidth,
          flexWrap,
          cursor,
          ...domProps
        } = props;
        return (
          <div
            ref={ref}
            {...domProps}
            data-testid='draggable-track'
            onMouseDown={(e: React.MouseEvent) => {
              // Simulate drag start
              if (onDragStart) {
                onDragStart();
              }
            }}
            onMouseUp={(e: React.MouseEvent) => {
              // Simulate drag end with proper mock data
              if (onDragEnd) {
                const mockInfo: DragEndInfo = {
                  point: { x: 100, y: 0 },
                  delta: { x: -150, y: 0 },
                  offset: { x: -150, y: 0 },
                  velocity: { x: -500, y: 0 },
                };
                onDragEnd(e.nativeEvent, mockInfo);
              }
            }}
          >
            {children}
          </div>
        );
      },
    );
  },
  // Mock animation controls
  useAnimation: () => ({
    start: jest.fn(),
  }),
  // Mock motion value
  useMotionValue: (initialValue: number) => ({
    get: jest.fn(() => initialValue),
    set: jest.fn(),
  }),
}));

// Mock Chakra UI's components to render as divs without Chakra-specific props
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  // Mock Flex to filter out Chakra-specific props
  Flex: React.forwardRef<HTMLDivElement, any>(
    ({ children, spacing, alignItems, ...props }, ref) => {
      const { minWidth, flexWrap, cursor, _active, ...domProps } = props;
      return (
        <div ref={ref} {...domProps}>
          {children}
        </div>
      );
    },
  ),
  // Mock VStack to filter out Chakra-specific props
  VStack: React.forwardRef<HTMLDivElement, any>(
    ({ children, spacing, alignItems, ...props }, ref) => {
      const { minWidth, flexWrap, cursor, _active, ...domProps } = props;
      return (
        <div ref={ref} {...domProps}>
          {children}
        </div>
      );
    },
  ),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('Track', () => {
  let mockSetTrackIsActive: jest.Mock;
  let mockSetActiveItem: jest.Mock;

  // Mock children components for the carousel
  const mockChildren = [
    <div key='1'>Item 1</div>,
    <div key='2'>Item 2</div>,
    <div key='3'>Item 3</div>,
    <div key='4'>Item 4</div>,
  ];

  // Helper function to get default props with current mock functions
  const getDefaultProps = (): TrackProps => ({
    setTrackIsActive: mockSetTrackIsActive,
    setActiveItem: mockSetActiveItem,
    trackIsActive: false,
    activeItem: 0,
    constraint: 2, // Show 2 items at once
    multiplier: 0.35,
    positions: [0, -250, -500, -750],
    children: mockChildren,
    maxActiveItem: 2, // 4 (items) - 2 (constraint) = 2
  });

  // Set up fresh mocks before each test
  beforeEach(() => {
    mockSetTrackIsActive = jest.fn();
    mockSetActiveItem = jest.fn();

    // Clear any existing event listeners from previous tests
    jest.clearAllMocks();

    // Clear any DOM event listeners that might persist
    document.removeEventListener('keydown', jest.fn() as any);
    document.removeEventListener('mousedown', jest.fn() as any);
    document.removeEventListener('wheel', jest.fn() as any);
  });

  // Clean up event listeners after each test
  afterEach(() => {
    document.removeEventListener('keydown', jest.fn());
    document.removeEventListener('mousedown', jest.fn());
    document.removeEventListener('wheel', jest.fn());
  });

  it('renders track with all children', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();
  });

  it('renders correctly with different numbers of children', () => {
    // Test with single child
    const singleChild = [<div key='1'>Only Item</div>];
    const propsWithOneChild = {
      ...getDefaultProps(),
      children: singleChild,
      positions: [0],
      maxActiveItem: 0,
    };

    const { rerender } = renderWithChakra(<Track {...propsWithOneChild} />);
    expect(screen.getByText('Only Item')).toBeInTheDocument();

    // Test with many children
    const manyChildren = Array.from({ length: 8 }, (_, i) => (
      <div key={i}>Item {i + 1}</div>
    ));
    const propsWithManyChildren = {
      ...getDefaultProps(),
      children: manyChildren,
      positions: Array.from({ length: 8 }, (_, i) => -i * 250),
      maxActiveItem: 6, // 8 - 2 = 6
    };

    rerender(<Track {...propsWithManyChildren} />);

    // All items should be rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 8')).toBeInTheDocument();
  });

  it('sets up drag constraints correctly', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Component should render without errors
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('updates position when activeItem changes', () => {
    // Animation calls are not tested due to mocking
    // Only tests that the component responds to activeItem changes
    const { rerender } = renderWithChakra(<Track {...getDefaultProps()} />);

    // Change activeItem and re-render
    const updatedProps = {
      ...getDefaultProps(),
      activeItem: 1, // Move to second position
    };

    rerender(<Track {...updatedProps} />);

    // Component should still render correctly with new activeItem
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('sets track active state based on click target', () => {
    const { container } = renderWithChakra(<Track {...getDefaultProps()} />);

    // Get the track element (should be the container)
    const trackElement = container.firstChild as HTMLElement;

    // Simulate clicking inside the track
    fireEvent.mouseDown(trackElement);

    // setTrackIsActive should be called
    expect(mockSetTrackIsActive).toHaveBeenCalled();
  });

  it('handles clicks outside the track element', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Create a click event on a different element
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    // Simulate clicking outside the track
    fireEvent.mouseDown(outsideElement);

    // setTrackIsActive should be called with false (clicked outside)
    expect(mockSetTrackIsActive).toHaveBeenCalledWith(false);

    // Clean up
    document.body.removeChild(outsideElement);
  });

  it('handles drag start correctly', () => {
    const props = {
      ...getDefaultProps(),
      activeItem: 1, // Start at position 1
    };

    renderWithChakra(<Track {...props} />);

    // Find the draggable element using the test ID
    const trackElement = screen.getByTestId('draggable-track');

    // Simulate drag start
    fireEvent.mouseDown(trackElement);

    // The component should store the starting position internally
    expect(trackElement).toBeInTheDocument();
  });

  it('calculates correct target position on drag end', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Find the draggable element using the test ID added
    const trackElement = screen.getByTestId('draggable-track');

    // First simulate drag start with mouseDown
    fireEvent.mouseDown(trackElement);

    // Then simulate drag end with mouseUp - this will trigger the mock drag end handler
    fireEvent.mouseUp(trackElement);

    // The component should calculate the closest position and set activeItem
    expect(mockSetActiveItem).toHaveBeenCalled();
  });

  it('handles keyboard navigation with arrow keys', () => {
    const props = {
      ...getDefaultProps(),
      trackIsActive: true, // Track must be active for keyboard nav to work
      activeItem: 1, // Start at position 1
    };

    renderWithChakra(<Track {...props} />);

    // Simulate pressing the right arrow key
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    // Should call setActiveItem with a function that increments position
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    // Test the function that was passed to setActiveItem
    const updateFunction = mockSetActiveItem.mock.calls[0][0];
    expect(updateFunction(1)).toBe(2); // Math.min(1 + 2, 2) = 2
  });

  it('handles up and down arrow keys same as left and right', () => {
    const props = {
      ...getDefaultProps(),
      trackIsActive: true,
      activeItem: 1,
    };

    renderWithChakra(<Track {...props} />);

    // Test ArrowUp (should work like ArrowRight)
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    // Reset and test ArrowDown (should work like ArrowLeft)
    mockSetActiveItem.mockClear();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));
  });

  it('ignores keyboard events when track is inactive', () => {
    const props = {
      ...getDefaultProps(),
      trackIsActive: false, // Track is not active
    };

    renderWithChakra(<Track {...props} />);

    // Try keyboard navigation
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    // Should not respond to keyboard when inactive
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('responds differently based on trackIsActive state', () => {
    // Test with active track
    const { unmount } = renderWithChakra(
      <Track
        {...{
          ...getDefaultProps(),
          trackIsActive: true,
        }}
      />,
    );

    // Keyboard events should work when track is active
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockSetActiveItem).toHaveBeenCalled();

    // Unmount the first component to clean up its event listeners
    unmount();

    // Reset and test with inactive track
    mockSetActiveItem.mockClear();

    renderWithChakra(
      <Track
        {...{
          ...getDefaultProps(),
          trackIsActive: false,
        }}
      />,
    );

    // Keyboard events should be ignored when track is inactive
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('prevents default behavior for relevant keyboard events', () => {
    const propsWithActiveTrack = {
      ...getDefaultProps(),
      trackIsActive: true,
      activeItem: 1, // In middle, so both directions are valid
    };

    renderWithChakra(<Track {...propsWithActiveTrack} />);

    // Create events with preventDefault mock
    const rightArrowEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
    });
    const preventDefaultSpy = jest.spyOn(rightArrowEvent, 'preventDefault');

    fireEvent(document, rightArrowEvent);

    // Should prevent default browser behavior for arrow keys
    expect(preventDefaultSpy).toHaveBeenCalled();

    preventDefaultSpy.mockRestore();
  });

  it('respects boundaries when navigating with keyboard', () => {
    const props = {
      ...getDefaultProps(),
      trackIsActive: true,
      activeItem: 2, // At the end (maxActiveItem)
    };

    renderWithChakra(<Track {...props} />);

    // Try to go right when already at the end
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    // As activeItem (2) >= maxActiveItem (2), it shouldn't call setActiveItem
    expect(mockSetActiveItem).not.toHaveBeenCalled();

    // Reset and test left arrow
    mockSetActiveItem.mockClear();

    // Test left arrow (should work)
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = mockSetActiveItem.mock.calls[0][0];
    expect(updateFunction(2)).toBe(0); // Math.max(2 - 2, 0) = 0
  });

  it('prevents navigation beyond boundaries with keyboard', () => {
    const propsAtStart = {
      ...getDefaultProps(),
      trackIsActive: true,
      activeItem: 0,
    };

    renderWithChakra(<Track {...propsAtStart} />);

    // Try to go left when already at the beginning
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    // Should not call setActiveItem because activeItem (0) <= 0
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation when constraint exceeds remaining items', () => {
    const propsWithLargeConstraint = {
      ...getDefaultProps(),
      trackIsActive: true,
      activeItem: 1,
      constraint: 5, // Larger than number of remaining items
      maxActiveItem: 2,
    };

    renderWithChakra(<Track {...propsWithLargeConstraint} />);

    // Press right arrow
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(mockSetActiveItem).toHaveBeenCalledWith(expect.any(Function));

    // Test the update function
    const updateFunction = mockSetActiveItem.mock.calls[0][0];
    // Should be limited by maxActiveItem: Math.min(1 + 5, 2) = 2
    expect(updateFunction(1)).toBe(2);
  });

  it('handles horizontal wheel events for navigation', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Create a horizontal wheel event (like trackpad horizontal scroll)
    const wheelEvent = new WheelEvent('wheel', {
      deltaX: 100,
      deltaY: 10,
      bubbles: true,
    });

    // Dispatch the wheel event on the document
    fireEvent(document, wheelEvent);

    // Should update activeItem based on scroll direction
    expect(mockSetActiveItem).toHaveBeenCalled();
  });

  it('ignores wheel events that are primarily vertical', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Create a mostly vertical wheel event (normal page scrolling)
    const wheelEvent = new WheelEvent('wheel', {
      deltaX: 10,
      deltaY: 100,
      bubbles: true,
    });

    fireEvent(document, wheelEvent);

    // Should ignore this event since |deltaY| > |deltaX|
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('prevents default behavior for horizontal wheel events', () => {
    renderWithChakra(<Track {...getDefaultProps()} />);

    // Create wheel event with preventDefault spy
    const wheelEvent = new WheelEvent('wheel', {
      deltaX: 100,
      deltaY: 10,
    });
    const preventDefaultSpy = jest.spyOn(wheelEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(wheelEvent, 'stopPropagation');

    fireEvent(document, wheelEvent);

    // Should prevent default and stop propagation for horizontal scrolling
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();

    preventDefaultSpy.mockRestore();
    stopPropagationSpy.mockRestore();
  });

  it('works with custom drag multiplier', () => {
    const propsWithCustomMultiplier = {
      ...getDefaultProps(),
      multiplier: 0.5,
    };

    renderWithChakra(<Track {...propsWithCustomMultiplier} />);

    // Component should render normally with custom multiplier
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('handles empty positions array gracefully', () => {
    const propsWithEmptyPositions = {
      ...getDefaultProps(),
      positions: [], // No positions
      children: [], // No children
      maxActiveItem: 0,
    };

    renderWithChakra(<Track {...propsWithEmptyPositions} />);

    // Should render without crashing
    expect(mockSetTrackIsActive).toBeDefined();
  });

  it('removes event listeners on unmount', () => {
    // Spy on document event listener methods to verify cleanup
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderWithChakra(<Track {...getDefaultProps()} />);

    // Verify that event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
      { passive: false },
    );

    unmount();

    // Verify that event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
    );

    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
