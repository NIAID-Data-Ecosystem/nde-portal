import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Item } from '../components/Item';
import { ItemProps } from '../types';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('Item', () => {
  let mockSetTrackIsActive: jest.Mock;
  let mockSetActiveItem: jest.Mock;
  let defaultProps: ItemProps;

  beforeEach(() => {
    mockSetTrackIsActive = jest.fn();
    mockSetActiveItem = jest.fn();

    defaultProps = {
      setTrackIsActive: mockSetTrackIsActive,
      setActiveItem: mockSetActiveItem,
      trackIsActive: false,
      constraint: 2,
      itemWidth: 200,
      positions: [0, -220, -440, -660],
      index: 1,
      gap: 20,
      children: <div>Test Item Content</div>, // Content to render inside the item
    };
  });

  it('renders the item with correct content and styling', () => {
    renderWithChakra(<Item {...defaultProps} />);

    expect(screen.getByText('Test Item Content')).toBeInTheDocument();

    const itemElement = screen.getByText('Test Item Content').parentElement;
    expect(itemElement).toHaveStyle('width: 200px');
  });

  it('uses fallback width when itemWidth is not provided', () => {
    const propsWithoutWidth = {
      ...defaultProps,
      itemWidth: 0, // No width provided
    };

    renderWithChakra(<Item {...propsWithoutWidth} />);

    const itemElement = screen.getByText('Test Item Content').parentElement;
    expect(itemElement).toHaveStyle('width: 200px');
  });

  it('applies correct margin when not the last item', () => {
    const propsWithGap = {
      ...defaultProps,
      gap: 24,
    };

    renderWithChakra(
      <div>
        <Item {...propsWithGap} index={0}>
          <div>First Item</div>
        </Item>
        <Item {...propsWithGap} index={1}>
          <div>Second Item</div>
        </Item>
        <Item {...propsWithGap} index={2}>
          <div>Last Item</div>
        </Item>
      </div>,
    );

    const firstItem = screen.getByText('First Item').parentElement;
    const secondItem = screen.getByText('Second Item').parentElement;
    const lastItem = screen.getByText('Last Item').parentElement;

    // Verify that non-last items have the gap margin
    expect(firstItem).toHaveStyle('margin-right: 24px');
    expect(secondItem).toHaveStyle('margin-right: 24px');

    // Verify that last item doesn't have the gap margin
    expect(lastItem).not.toHaveStyle('margin-right: 24px');
  });

  it('handles edge case with single item (no margin needed)', () => {
    renderWithChakra(
      <div>
        <Item {...defaultProps} gap={24} index={0}>
          <div>Single Item</div>
        </Item>
      </div>,
    );

    const singleItem = screen.getByText('Single Item').parentElement!;

    // Single item is also the last item, so should not have margin
    expect(singleItem).not.toHaveStyle('margin-right: 24px');
  });

  it('activates track when item receives focus', () => {
    renderWithChakra(<Item {...defaultProps} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    // Simulate focusing on the item using fireEvent
    fireEvent.focus(itemElement);

    // setTrackIsActive should be called with true
    expect(mockSetTrackIsActive).toHaveBeenCalledWith(true);
  });

  it('sets active item when Tab key is pressed and item is within bounds', () => {
    // Create props where this item (index 1) is within the valid range
    // maxActiveItem = positions.length - constraint = 4 - 2 = 2
    const propsWithValidIndex = {
      ...defaultProps,
      index: 1,
      positions: [0, -220, -440, -660],
      constraint: 2, // Show 2 items at once
    };

    renderWithChakra(<Item {...propsWithValidIndex} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    // Focus the item and simulate Tab key up event
    itemElement.focus();
    fireEvent.keyUp(itemElement, { key: 'Tab' });

    // When Tab is pressed, setActiveItem should be called with the item's index
    expect(mockSetActiveItem).toHaveBeenCalledWith(1);
  });

  it('does not set active item when Tab is pressed and item is beyond maxActiveItem', () => {
    // Create props where this item (index 3) is beyond the valid range
    // maxActiveItem = 4 - 2 = 2, so index 3 > 2 (invalid)
    const propsWithInvalidIndex = {
      ...defaultProps,
      index: 3,
      positions: [0, -220, -440, -660],
      constraint: 2,
    };

    renderWithChakra(<Item {...propsWithInvalidIndex} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    itemElement.focus();
    fireEvent.keyUp(itemElement, { key: 'Tab' });

    // setActiveItem shouldn't be called because index 3 > maxActiveItem (2)
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('deactivates track when last item loses focus after Tab navigation', () => {
    // Create props for the last item in the positions array
    const propsForLastItem = {
      ...defaultProps,
      index: 3, // Last item (positions.length - 1)
      positions: [0, -220, -440, -660], // 4 positions (0, 1, 2, 3)
    };

    renderWithChakra(<Item {...propsForLastItem} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    // First, simulate Tab keydown to set the userDidTab flag
    itemElement.focus();
    fireEvent.keyDown(itemElement, { key: 'Tab' });

    // Then simulate blur (losing focus)
    fireEvent.blur(itemElement);

    // For the last item after Tab navigation, track should be deactivated
    expect(mockSetTrackIsActive).toHaveBeenCalledWith(false);
  });

  it('does not deactivate track when non-last item loses focus', async () => {
    renderWithChakra(<Item {...defaultProps} />); // index: 1 (not last)

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    itemElement.focus();
    fireEvent.keyDown(itemElement, { key: 'Tab' });
    fireEvent.blur(itemElement);

    // Track shouldn't be deactivated because this is not the last item
    expect(mockSetTrackIsActive).not.toHaveBeenCalledWith(false);
  });

  it('does not deactivate track when item loses focus without Tab navigation', async () => {
    const propsForLastItem = {
      ...defaultProps,
      index: 3,
      positions: [0, -220, -440, -660],
    };

    renderWithChakra(<Item {...propsForLastItem} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    // Focus and blur without pressing Tab first
    itemElement.focus();
    fireEvent.blur(itemElement);

    // Track shouldn't be deactivated because userDidTab is false
    expect(mockSetTrackIsActive).not.toHaveBeenCalledWith(false);
  });

  it('has proper accessibility structure', () => {
    renderWithChakra(<Item {...defaultProps} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    // Item should be focusable (for keyboard navigation)
    expect(itemElement).toHaveProperty('tabIndex');

    // Should have the correct CSS class
    expect(itemElement).toHaveClass('item');
  });

  it('ignores non-Tab keyboard events', () => {
    renderWithChakra(<Item {...defaultProps} />);

    const itemElement = screen.getByText('Test Item Content').parentElement!;

    itemElement.focus();
    fireEvent.keyUp(itemElement, { key: 'Enter' });

    // setActiveItem shouldn't be called for non-Tab keys
    expect(mockSetActiveItem).not.toHaveBeenCalled();
  });

  it('renders different types of children correctly', () => {
    const complexChild = (
      <div>
        <h3>Card Title</h3>
        <p>Card description</p>
        <button>Action Button</button>
      </div>
    );

    const propsWithComplexChild = {
      ...defaultProps,
      children: complexChild,
    };

    renderWithChakra(<Item {...propsWithComplexChild} />);

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
