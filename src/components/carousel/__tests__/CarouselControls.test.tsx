import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { CarouselControls } from '../components/CarouselControls';
import { CarouselControlsProps } from '../types';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('CarouselControls', () => {
  let mockHandleDecrementClick = jest.fn();
  let mockHandleIncrementClick = jest.fn();
  let mockHandleDotClick = jest.fn();
  let mockHandleFocus = jest.fn();

  const getDefaultProps = (): CarouselControlsProps => ({
    activeItem: 0,
    maxActiveItem: 3,
    constraint: 2,
    totalDots: 3,
    colorScheme: 'primary',
    gap: 32,
    childrenLength: 5,
    showProgressBar: false,
    progressPercentage: 0,
    isLoading: false,
    handleDecrementClick: mockHandleDecrementClick,
    handleIncrementClick: mockHandleIncrementClick,
    handleDotClick: mockHandleDotClick,
    handleFocus: mockHandleFocus,
  });

  beforeEach(() => {
    mockHandleDecrementClick = jest.fn();
    mockHandleIncrementClick = jest.fn();
    mockHandleDotClick = jest.fn();
    mockHandleFocus = jest.fn();
  });

  it('renders navigation buttons and dots correctly', () => {
    // Render the component with default props
    renderWithChakra(<CarouselControls {...getDefaultProps()} />);

    // Check that navigation buttons exist and have correct labels
    const prevButton = screen.getByLabelText('previous carousel item');
    expect(prevButton).toBeInTheDocument();

    const nextButton = screen.getByLabelText('next carousel item');
    expect(nextButton).toBeInTheDocument();

    // Count all interactive elements (navigation buttons and dots)
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(5);

    // Check that dots (carousel indicators) exist and have correct labels
    expect(
      screen.getByLabelText('carousel indicator 1 of 3 (current)'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 2 of 3'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 3 of 3'),
    ).toBeInTheDocument();
  });

  it('renders nothing when childrenLength is not greater than constraint', () => {
    const props = {
      ...getDefaultProps(),
      childrenLength: 2,
      constraint: 2,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // There should be no interactive elements when navigation isn't needed
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('calls handleDecrementClick when previous button is clicked', async () => {
    const user = userEvent.setup();

    // Create a specific mock function for this test
    // activeItem is set to 1 so that the previous button is enabled
    const mockDecrement = jest.fn();
    const props = {
      ...getDefaultProps(),
      activeItem: 1,
      handleDecrementClick: mockDecrement,
    };

    renderWithChakra(<CarouselControls {...props} />);

    const prevButton = screen.getByLabelText('previous carousel item');

    // Verify that the previous button is clickable
    expect(prevButton).not.toBeDisabled();

    // Simulate user clicking the previous button
    await user.click(prevButton);

    // Verify that the function was called only once
    expect(mockDecrement).toHaveBeenCalledTimes(1);
  });

  it('calls handleIncrementClick when next button is clicked', async () => {
    const user = userEvent.setup();

    const mockIncrement = jest.fn();
    const props = {
      ...getDefaultProps(),
      handleIncrementClick: mockIncrement,
    };

    renderWithChakra(<CarouselControls {...props} />);

    const nextButton = screen.getByLabelText('next carousel item');

    await user.click(nextButton);

    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });

  it('calls handleDotClick with correct index when dot is clicked', async () => {
    const user = userEvent.setup();

    const mockDotClick = jest.fn();
    const props = {
      ...getDefaultProps(),
      handleDotClick: mockDotClick,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // Click the second dot
    const secondDot = screen.getByLabelText('carousel indicator 2 of 3');
    await user.click(secondDot);

    // Verify that handler was called with correct index (only once)
    expect(mockDotClick).toHaveBeenCalledWith(1);
    expect(mockDotClick).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key navigation on dots correctly', async () => {
    const user = userEvent.setup();

    const mockDotClick = jest.fn();
    const props = {
      ...getDefaultProps(),
      handleDotClick: mockDotClick,
    };

    renderWithChakra(<CarouselControls {...props} />);

    const firstDot = screen.getByLabelText(
      'carousel indicator 1 of 3 (current)',
    );

    // Focus on the dot and test Enter key
    firstDot.focus();
    await user.keyboard('{Enter}');

    expect(mockDotClick).toHaveBeenCalledWith(0);
    expect(mockDotClick).toHaveBeenCalledTimes(1);
  });

  it('handles spacebar navigation on dots correctly', async () => {
    const user = userEvent.setup();

    const mockDotClick = jest.fn();
    const props = {
      ...getDefaultProps(),
      handleDotClick: mockDotClick,
    };

    renderWithChakra(<CarouselControls {...props} />);

    const firstDot = screen.getByLabelText(
      'carousel indicator 1 of 3 (current)',
    );

    // Focus on the dot and test spacebar
    firstDot.focus();
    await user.keyboard(' ');

    expect(mockDotClick).toHaveBeenCalledWith(0);
    expect(mockDotClick).toHaveBeenCalledTimes(1);
  });

  it('disables previous button when at the beginning', () => {
    // Use default props (activeItem = 0)
    renderWithChakra(<CarouselControls {...getDefaultProps()} />);

    // If activeItem <= 0, the previous button is disabled
    const prevButton = screen.getByLabelText('previous carousel item');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button when at the end', () => {
    const props = {
      ...getDefaultProps(),
      activeItem: 3, // maxActiveItem = 3
    };

    renderWithChakra(<CarouselControls {...props} />);

    // If activeItem >= maxActiveItem, the next button is disabled
    const nextButton = screen.getByLabelText('next carousel item');
    expect(nextButton).toBeDisabled();
  });

  it('renders progress bar when showProgressBar is true', () => {
    const props = {
      ...getDefaultProps(),
      showProgressBar: true,
      progressPercentage: 50,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // Chakra UI Progress component creates nested progressbar elements
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(1);

    // Check the main progress bar has correct accessibility attributes
    const mainProgressBar = progressBars[0];
    expect(mainProgressBar).toHaveAttribute('aria-valuemin', '0');
    expect(mainProgressBar).toHaveAttribute('aria-valuemax', '100');
    expect(mainProgressBar).toHaveAttribute('aria-valuenow', '50');
    expect(mainProgressBar).toHaveAttribute(
      'aria-label',
      'Carousel progress: 50% complete',
    );

    // Verify that navigation buttons are present
    const prevButton = screen.getByLabelText('previous carousel item');
    const nextButton = screen.getByLabelText('next carousel item');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Verify that dot indicators aren't present
    expect(
      screen.queryByLabelText(/carousel indicator/),
    ).not.toBeInTheDocument();

    // Verify that only 2 buttons are present (prev + next, no dot buttons)
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(2);
  });

  it('renders skeleton when isLoading is true', () => {
    const props = {
      ...getDefaultProps(),
      isLoading: true,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // Verify the component doesn't break during loading
    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
  });

  it('calls handleFocus when buttons receive focus', async () => {
    const mockFocus = jest.fn();
    const props = {
      ...getDefaultProps(),
      handleFocus: mockFocus,
    };

    renderWithChakra(<CarouselControls {...props} />);

    const prevButton = screen.getByLabelText('previous carousel item');

    // Test pure focus behavior
    fireEvent.focus(prevButton);

    expect(mockFocus).toHaveBeenCalled();
  });

  it('highlights the correct dot based on activeItem and constraint', () => {
    const props = {
      ...getDefaultProps(),
      activeItem: 2,
      constraint: 2,
      totalDots: 3,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // The current group should be Math.floor(2 / 2) = 1
    // The second dot should be highlighted
    expect(
      screen.getByLabelText('carousel indicator 1 of 3'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 2 of 3 (current)'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 3 of 3'),
    ).toBeInTheDocument();
  });

  it('highlights last dot when at the end of carousel', () => {
    const props = {
      ...getDefaultProps(),
      activeItem: 3,
      maxActiveItem: 3,
      constraint: 2,
      childrenLength: 5,
      totalDots: 3,
    };

    renderWithChakra(<CarouselControls {...props} />);

    // When at the end of the carousel, the last dot should be highlighted
    expect(
      screen.getByLabelText('carousel indicator 3 of 3 (current)'),
    ).toBeInTheDocument();
  });
});
