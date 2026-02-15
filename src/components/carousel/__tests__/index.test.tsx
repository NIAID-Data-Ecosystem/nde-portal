import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { Carousel } from '../index';

// Mock the useResizeObserver hook (it's used to detect container width)
jest.mock('usehooks-ts', () => ({
  useResizeObserver: jest.fn(() => ({
    width: 800,
    height: 400,
  })),
}));

// Mock Chakra UI's useMediaQuery (employed in useCarouselState)
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: jest.fn(() => [false]),
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

// Mock framer-motion to simplify animation testing
jest.mock('framer-motion', () => ({
  motion: (Component: any) => {
    const MotionComponent = React.forwardRef<any, any>(
      ({ children, ...props }, ref) => {
        const {
          animate,
          initial,
          exit,
          transition,
          variants,
          drag,
          dragConstraints,
          dragElastic,
          dragMomentum,
          dragTransition,
          whileHover,
          whileTap,
          whileFocus,
          whileDrag,
          whileInView,
          onAnimationStart,
          onAnimationComplete,
          onHoverStart,
          onHoverEnd,
          onTap,
          onTapStart,
          onTapCancel,
          onDrag,
          onDragStart,
          onDragEnd,
          onDirectionLock,
          onViewportEnter,
          onViewportLeave,
          style,
          ...domProps
        } = props;

        return (
          <Component ref={ref} {...domProps} style={style}>
            {children}
          </Component>
        );
      },
    );
    MotionComponent.displayName = `Motion${
      Component.displayName || Component.name || 'Component'
    }`;
    return MotionComponent;
  },
  useAnimation: () => ({
    start: jest.fn(),
  }),
  useMotionValue: (initialValue: number) => ({
    get: jest.fn(() => initialValue),
    set: jest.fn(),
  }),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
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

describe('Carousel', () => {
  // Sample carousel items for testing
  const mockChildren = [
    <div key='1'>Carousel Item 1</div>,
    <div key='2'>Carousel Item 2</div>,
    <div key='3'>Carousel Item 3</div>,
    <div key='4'>Carousel Item 4</div>,
    <div key='5'>Carousel Item 5</div>,
  ];

  const defaultProps = {
    colorScheme: 'primary',
    gap: 32,
    isLoading: false,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useMediaQuery to default state
    const { useMediaQuery } = require('@chakra-ui/react');
    (useMediaQuery as jest.Mock).mockReturnValue([false]);
  });

  it('renders carousel with all children and controls', () => {
    mockMediaQueries('tablet');

    renderWithChakra(<Carousel {...defaultProps}>{mockChildren}</Carousel>);

    // All carousel items should be rendered
    expect(screen.getByText('Carousel Item 1')).toBeInTheDocument();
    expect(screen.getByText('Carousel Item 2')).toBeInTheDocument();
    expect(screen.getByText('Carousel Item 3')).toBeInTheDocument();
    expect(screen.getByText('Carousel Item 4')).toBeInTheDocument();
    expect(screen.getByText('Carousel Item 5')).toBeInTheDocument();

    // Navigation controls should be rendered
    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
    expect(screen.getByLabelText('next carousel item')).toBeInTheDocument();

    // Should have pagination dots (5 items, constraint = 2 => 3 dots total)
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

  it('works with minimal props using default values', () => {
    mockMediaQueries('mobile');

    // Only provide required children, no other props
    renderWithChakra(<Carousel>{mockChildren}</Carousel>);

    expect(screen.getByText('Carousel Item 1')).toBeInTheDocument();
    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
  });

  it('has correct DOM structure and CSS classes', () => {
    mockMediaQueries('tablet');

    const { container } = renderWithChakra(
      <Carousel {...defaultProps}>{mockChildren}</Carousel>,
    );

    // Should have the padded-carousel class
    const paddedCarousel = container.querySelector('.padded-carousel');
    expect(paddedCarousel).toBeInTheDocument();

    // Should have items with the 'item' class
    const items = container.querySelectorAll('.item');
    expect(items).toHaveLength(5);
  });

  it('renders complex children content correctly', () => {
    mockMediaQueries('tablet');

    // Create complex carousel items
    const complexChildren = [
      <div key='1'>
        <h3>Card 1 Title</h3>
        <p>Card 1 description</p>
        <button>Action 1</button>
      </div>,
      <div key='2'>
        <h3>Card 2 Title</h3>
        <p>Card 2 description</p>
        <button>Action 2</button>
      </div>,
      <div key='3'>
        <div>Test Image Placeholder</div>
        <span>Image caption</span>
      </div>,
    ];

    renderWithChakra(<Carousel {...defaultProps}>{complexChildren}</Carousel>);

    // All complex content should be rendered
    expect(screen.getByText('Card 1 Title')).toBeInTheDocument();
    expect(screen.getByText('Card 1 description')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2 Title')).toBeInTheDocument();
    expect(screen.getByText('Test Image Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Image caption')).toBeInTheDocument();
  });

  it('allows navigation between items using controls', async () => {
    const user = userEvent.setup();
    mockMediaQueries('tablet'); // Tablet (constraint: 2)

    renderWithChakra(<Carousel {...defaultProps}>{mockChildren}</Carousel>);

    // Previous button should be disabled (at start)
    const prevButton = screen.getByLabelText('previous carousel item');
    const nextButton = screen.getByLabelText('next carousel item');

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Click next button to advance
    await user.click(nextButton);

    // After clicking next, the previous button shouldn't be disabled
    await waitFor(() => {
      expect(prevButton).not.toBeDisabled();
    });
  });

  it('allows navigation using pagination dots', async () => {
    const user = userEvent.setup();
    mockMediaQueries('tablet'); // Tablet: (5 items, constraint = 2 => 3 dots total)

    renderWithChakra(<Carousel {...defaultProps}>{mockChildren}</Carousel>);

    // Initially, first dot should be active (current)
    expect(
      screen.getByLabelText('carousel indicator 1 of 3 (current)'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 2 of 3'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 3 of 3'),
    ).toBeInTheDocument();

    // Previous button should be disabled at start
    const prevButton = screen.getByLabelText('previous carousel item');
    const nextButton = screen.getByLabelText('next carousel item');
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Click on the second dot to navigate
    const secondDot = screen.getByLabelText('carousel indicator 2 of 3');
    await user.click(secondDot);

    // Wait for state updates and verify navigation occurred
    await waitFor(() => {
      // Second dot should now be active
      expect(
        screen.getByLabelText('carousel indicator 2 of 3 (current)'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('carousel indicator 1 of 3'),
      ).toBeInTheDocument();

      // Navigation buttons should both be enabled
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    // Click on the third (last) dot
    const thirdDot = screen.getByLabelText('carousel indicator 3 of 3');
    await user.click(thirdDot);

    await waitFor(() => {
      // Third dot should now be active
      expect(
        screen.getByLabelText('carousel indicator 3 of 3 (current)'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('carousel indicator 2 of 3'),
      ).toBeInTheDocument();

      // Next button should be disabled
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    // Navigate back to first dot
    const firstDot = screen.getByLabelText('carousel indicator 1 of 3');
    await user.click(firstDot);

    await waitFor(() => {
      // First dot should be active again
      expect(
        screen.getByLabelText('carousel indicator 1 of 3 (current)'),
      ).toBeInTheDocument();

      // Should be back at start, so previous button disabled
      expect(prevButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('shows controls when items exceed constraint', () => {
    mockMediaQueries('mobile'); // Mobile layout (constraint: 1)

    renderWithChakra(
      <Carousel {...defaultProps}>
        {[<div key='1'>Item 1</div>, <div key='2'>Item 2</div>]}
      </Carousel>,
    );

    // Should show controls because 2 items > 1 constraint
    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
    expect(screen.getByLabelText('next carousel item')).toBeInTheDocument();
  });

  it('hides controls when all items fit in viewport', () => {
    mockMediaQueries('desktop'); // Desktop layout (constraint: 3)

    // Create 3 items for desktop layout
    const exactFitChildren = [
      <div key='1'>Item 1</div>,
      <div key='2'>Item 2</div>,
      <div key='3'>Item 3</div>, // items = constraint = 3
    ];

    renderWithChakra(<Carousel {...defaultProps}>{exactFitChildren}</Carousel>);

    // Should render all items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();

    // Should not show navigation controls
    expect(
      screen.queryByLabelText('previous carousel item'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('next carousel item'),
    ).not.toBeInTheDocument();
  });

  it('shows progress bar when there are many items', () => {
    mockMediaQueries('mobile');

    // Create many items to trigger progress bar
    const manyChildren = Array.from({ length: 15 }, (_, i) => (
      <div key={i}>Item {i + 1}</div>
    ));

    renderWithChakra(<Carousel {...defaultProps}>{manyChildren}</Carousel>);

    // Should show progress bar instead of dots - get the main progress bar
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);

    // Should not show individual dots when progress bar is shown
    expect(
      screen.queryByLabelText(/carousel indicator \d+ of/),
    ).not.toBeInTheDocument();
  });

  it('integrates responsive behavior correctly across breakpoints with boundary testing', () => {
    const threeChildren = [
      <div key='1'>Item 1</div>,
      <div key='2'>Item 2</div>,
      <div key='3'>Item 3</div>,
    ];

    // Mobile: 3 items, constraint = 1 => 3 dots
    mockMediaQueries('mobile');
    const { rerender } = renderWithChakra(
      <Carousel {...defaultProps}>{threeChildren}</Carousel>,
    );

    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 1 of 3 (current)'),
    ).toBeInTheDocument();

    // Tablet: 3 items, constraint = 2 => 2 dots
    jest.clearAllMocks();
    mockMediaQueries('tablet');
    rerender(<Carousel {...defaultProps}>{threeChildren}</Carousel>);

    expect(screen.getByLabelText('previous carousel item')).toBeInTheDocument();
    expect(
      screen.getByLabelText('carousel indicator 1 of 2 (current)'),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('carousel indicator 3 of'),
    ).not.toBeInTheDocument();

    // Desktop: 3 items, constraint = 3 => no controls needed
    jest.clearAllMocks();
    mockMediaQueries('desktop');
    rerender(<Carousel {...defaultProps}>{threeChildren}</Carousel>);

    expect(
      screen.queryByLabelText('previous carousel item'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/carousel indicator/),
    ).not.toBeInTheDocument();
  });

  it('provides proper accessibility attributes', () => {
    mockMediaQueries('tablet');

    renderWithChakra(<Carousel {...defaultProps}>{mockChildren}</Carousel>);

    // Check navigation button accessibility
    const prevButton = screen.getByLabelText('previous carousel item');
    const nextButton = screen.getByLabelText('next carousel item');

    expect(prevButton).toHaveAttribute('aria-label', 'previous carousel item');
    expect(nextButton).toHaveAttribute('aria-label', 'next carousel item');

    // Check dot accessibility
    const firstDot = screen.getByLabelText(
      'carousel indicator 1 of 3 (current)',
    );
    expect(firstDot).toHaveAttribute('role', 'button');
    expect(firstDot).toHaveAttribute('tabindex', '0');
  });

  it('provides proper accessibility for progress bar and updates correctly', async () => {
    const user = userEvent.setup();
    mockMediaQueries('mobile');

    // Create enough items to trigger progress bar
    const manyChildren = Array.from({ length: 12 }, (_, i) => (
      <div key={i}>Item {i + 1}</div>
    ));

    renderWithChakra(<Carousel {...defaultProps}>{manyChildren}</Carousel>);

    // Check initial progress bar accessibility
    let progressBar = screen.getByLabelText('Carousel progress: 0% complete');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('role', 'progressbar');

    // Navigate forward once
    const nextButton = screen.getByLabelText('next carousel item');
    await user.click(nextButton);

    // Progress should update
    await waitFor(() => {
      const updatedProgressBar = screen.getByLabelText(
        /Carousel progress: \d+% complete/,
      );
      expect(updatedProgressBar).toBeInTheDocument();
      const ariaNow = updatedProgressBar.getAttribute('aria-valuenow');
      expect(parseInt(ariaNow!)).toBeGreaterThan(0);
    });
  });

  it('displays loading state correctly', () => {
    mockMediaQueries('tablet');

    renderWithChakra(
      <Carousel {...defaultProps} isLoading={true}>
        {mockChildren}
      </Carousel>,
    );

    // Content should still render (skeleton handles the loading display)
    expect(screen.getByText('Carousel Item 1')).toBeInTheDocument();

    // Controls should show loading state (skeleton)
    const prevButton = screen.getByLabelText('previous carousel item');
    expect(prevButton).toBeInTheDocument();
  });

  it('handles single carousel item correctly', () => {
    mockMediaQueries('mobile');

    renderWithChakra(
      <Carousel {...defaultProps}>{[<div key='1'>Only Item</div>]}</Carousel>,
    );

    // Should render the single item
    expect(screen.getByText('Only Item')).toBeInTheDocument();

    // Should not render controls (childrenLength <= constraint)
    expect(
      screen.queryByLabelText('previous carousel item'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('next carousel item'),
    ).not.toBeInTheDocument();
  });

  it('handles empty children array gracefully', () => {
    mockMediaQueries('mobile');

    renderWithChakra(<Carousel {...defaultProps}>{[]}</Carousel>);

    // Should not crash, and should not show controls
    expect(
      screen.queryByLabelText('previous carousel item'),
    ).not.toBeInTheDocument();
  });
});
