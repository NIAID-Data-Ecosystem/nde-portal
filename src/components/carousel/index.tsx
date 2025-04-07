import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import {
  Box,
  Button,
  Flex,
  Icon,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import { theme } from 'src/theme';
import { useResizeObserver } from 'usehooks-ts';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const TRANSITION_PROPS = {
  spring: {
    type: 'spring',
    stiffness: 200,
    damping: 60,
    mass: 3,
  },
  ease: {
    type: 'ease',
    ease: 'easeInOut',
    duration: 0.4,
  },
};

const MotionFlex = motion(Flex);

interface CarouselProps {
  gap?: number;
  colorScheme?: string;
  children: React.ReactNode[];
}

export const Carousel = ({
  children,
  colorScheme = 'primary',
  gap = 32,
}: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: containerRef,
    box: 'border-box',
  });

  const [itemWidth, setItemWidth] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const [trackIsActive, setTrackIsActive] = useState(false);
  const [constraint, setConstraint] = useState(0);

  const breakpoints = theme.breakpoints as unknown as {
    base: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  const [isBetweenBaseAndMd] = useMediaQuery(
    `(min-width: ${breakpoints.base}) and (max-width: ${breakpoints.md})`,
  );
  const [isBetweenMdAndXl] = useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.xl})`,
  );
  const [isGreaterThanXL] = useMediaQuery(`(min-width: ${breakpoints.xl})`);

  // Calculate item positions based on width
  const positions = useMemo(
    () => children.map((_, index) => -Math.abs((itemWidth + gap) * index)),
    [children, itemWidth, gap],
  );

  // Update itemWidth and constraint based on screen size
  useEffect(() => {
    if (isBetweenBaseAndMd) {
      setItemWidth(width - gap);
      setConstraint(1);
    } else if (isBetweenMdAndXl) {
      setItemWidth(width / 2 - gap);
      setConstraint(2);
    } else if (isGreaterThanXL) {
      const itemsPerView = children.length < 3 ? 2 : 3;
      setItemWidth(width / itemsPerView - gap);
      setConstraint(itemsPerView);
    }
  }, [
    isBetweenBaseAndMd,
    isBetweenMdAndXl,
    isGreaterThanXL,
    width,
    gap,
    children.length,
  ]);

  // Calculate maximum active item index and total carousel indicators (dots)
  const maxActiveItem = Math.max(0, children.length - constraint);
  const totalDots = Math.max(
    1,
    Math.ceil(children.length / Math.max(1, constraint)),
  );

  // Navigation handlers
  const handleFocus = () => setTrackIsActive(true);

  const handleDecrementClick = () => {
    setTrackIsActive(true);
    setActiveItem(prev => Math.max(0, prev - constraint));
  };

  const handleIncrementClick = () => {
    setTrackIsActive(true);
    setActiveItem(prev => Math.min(maxActiveItem, prev + constraint));
  };

  const handleDotClick = (index: number) => {
    const targetActiveItem = Math.min(index * constraint, maxActiveItem);
    setActiveItem(targetActiveItem);
  };

  // Props for child components
  const itemProps = {
    setActiveItem,
    setTrackIsActive,
    trackIsActive,
    constraint,
    itemWidth,
    positions,
    gap,
  };

  const trackProps = {
    setTrackIsActive,
    trackIsActive,
    setActiveItem,
    width,
    activeItem,
    constraint,
    positions,
    children,
    maxActiveItem,
  };

  return (
    <Flex ref={containerRef} direction='column' align='center'>
      <Box className='padded-carousel' w='100%' overflow='hidden' p={2}>
        {itemWidth > 0 && (
          <Track {...trackProps}>
            {children.map((child, index) => (
              <Item {...itemProps} index={index} key={index}>
                {child}
              </Item>
            ))}
          </Track>
        )}

        <Flex
          w={`${itemWidth}px`}
          mt={`${gap}px`}
          mx='auto'
          alignItems='center'
          justify='center'
        >
          <CarouselControls
            activeItem={activeItem}
            maxActiveItem={maxActiveItem}
            constraint={constraint}
            totalDots={totalDots}
            colorScheme={colorScheme}
            gap={gap}
            handleDecrementClick={handleDecrementClick}
            handleIncrementClick={handleIncrementClick}
            handleDotClick={handleDotClick}
            handleFocus={handleFocus}
            childrenLength={children.length}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

interface CarouselControlsProps {
  activeItem: number;
  maxActiveItem: number;
  constraint: number;
  totalDots: number;
  colorScheme: string;
  gap: number;
  handleDecrementClick: () => void;
  handleIncrementClick: () => void;
  handleDotClick: (index: number) => void;
  handleFocus: () => void;
  childrenLength: number;
}

const CarouselControls = ({
  activeItem,
  maxActiveItem,
  constraint,
  totalDots,
  colorScheme,
  gap,
  handleDecrementClick,
  handleIncrementClick,
  handleDotClick,
  handleFocus,
  childrenLength,
}: CarouselControlsProps) => {
  return (
    <>
      <Button
        aria-label='previous carousel item'
        onClick={handleDecrementClick}
        onFocus={handleFocus}
        isDisabled={childrenLength <= constraint || activeItem <= 0}
        mr={`${gap / 3}px`}
        color={`${colorScheme}.800`}
        variant='ghost'
        minW={0}
        size='sm'
      >
        <Icon as={FaAngleLeft} boxSize={4} />
      </Button>

      <Flex>
        {Array.from({ length: totalDots }, (_, i) => {
          // Calculate which group of items is currently active
          const currentGroup = Math.floor(activeItem / constraint);
          const isLastGroup = activeItem >= childrenLength - constraint;
          const shouldHighlight = isLastGroup
            ? i === totalDots - 1
            : i === currentGroup;

          return (
            <Box
              aria-label={`carousel indicator ${i} ${
                shouldHighlight ? 'highlighted' : ''
              }`}
              key={i}
              w={3}
              h={3}
              mx={1}
              borderRadius='50%'
              borderWidth='1px'
              borderColor={`${colorScheme}.500`}
              bg={shouldHighlight ? `${colorScheme}.500` : '#ffffff'}
              cursor='pointer'
              _hover={{
                bg: shouldHighlight
                  ? `${colorScheme}.600`
                  : `${colorScheme}.200`,
                borderColor: `${colorScheme}.600`,
              }}
              onClick={() => handleDotClick(i)}
            />
          );
        })}
      </Flex>

      <Button
        aria-label='next carousel item'
        onClick={handleIncrementClick}
        onFocus={handleFocus}
        isDisabled={childrenLength <= constraint || activeItem >= maxActiveItem}
        ml={`${gap / 3}px`}
        color={`${colorScheme}.800`}
        variant='ghost'
        minW={0}
        size='sm'
      >
        <Icon as={FaAngleRight} boxSize={4} />
      </Button>
    </>
  );
};

interface TrackProps {
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  trackIsActive: boolean;
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  activeItem: number;
  constraint: number;
  multiplier?: number;
  positions: number[];
  children: React.ReactNode[];
  maxActiveItem: number;
}

const Track = ({
  setTrackIsActive,
  trackIsActive,
  setActiveItem,
  activeItem,
  constraint,
  multiplier = 0.35,
  positions,
  children,
  maxActiveItem,
}: TrackProps) => {
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const node = useRef<HTMLDivElement>(null);

  const handleDragStart = () => setDragStartPosition(positions[activeItem]);

  const handleDragEnd = (
    _: Event,
    info: {
      point: { x: number; y: number };
      delta: { x: number; y: number };
      offset: { x: number; y: number };
      velocity: { x: number; y: number };
    },
  ) => {
    const distance = info.offset.x;
    const velocity = info.velocity.x * multiplier;
    const direction = velocity < 0 || distance < 0 ? 1 : -1;

    const extrapolatedPosition =
      dragStartPosition +
      (direction === 1
        ? Math.min(velocity, distance)
        : Math.max(velocity, distance));

    const closestPosition = positions.reduce((prev: number, curr: number) => {
      return Math.abs(curr - extrapolatedPosition) <
        Math.abs(prev - extrapolatedPosition)
        ? curr
        : prev;
    }, 0);

    const closestPositionIndex = positions.indexOf(closestPosition);
    const isNearEnd =
      Math.abs(extrapolatedPosition - positions[maxActiveItem]) < 10;

    // Determine the target position
    const targetIndex = isNearEnd
      ? maxActiveItem
      : Math.min(closestPositionIndex, maxActiveItem);

    setActiveItem(targetIndex);
    controls.start({
      x: positions[targetIndex],
      transition: {
        velocity: info.velocity.x,
        ...TRANSITION_PROPS.spring,
      },
    });
  };

  const handleResize = useCallback(() => {
    controls.start({
      x: positions[activeItem],
      transition: TRANSITION_PROPS.spring,
    });
  }, [activeItem, controls, positions]);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!node.current) return;
      setTrackIsActive(node.current.contains(event.target as Node));
    },
    [setTrackIsActive],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (trackIsActive) {
        if (
          (event.key === 'ArrowRight' || event.key === 'ArrowUp') &&
          activeItem < maxActiveItem
        ) {
          event.preventDefault();
          setActiveItem(prev => Math.min(prev + constraint, maxActiveItem));
        }

        if (
          (event.key === 'ArrowLeft' || event.key === 'ArrowDown') &&
          activeItem > 0
        ) {
          event.preventDefault();
          setActiveItem(prev => Math.max(prev - constraint, 0));
        }
      }
    },
    [trackIsActive, setActiveItem, activeItem, constraint, maxActiveItem],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;

      event.preventDefault();
      event.stopPropagation();

      const minPosition = positions[0];
      const maxPosition = positions[maxActiveItem];

      let newX = x.get() - event.deltaX;
      newX = Math.max(Math.min(newX, minPosition), maxPosition);

      x.set(newX);
      controls.start({
        x: newX,
        transition: TRANSITION_PROPS.ease,
      });

      const isNearEnd = Math.abs(newX - maxPosition) < 20;

      if (isNearEnd) {
        setActiveItem(maxActiveItem);
      } else {
        // Find the position index closest to the current position
        const newActiveIndex = positions.reduce(
          (prevIndex, position, index) => {
            return Math.abs(position - newX) <
              Math.abs(positions[prevIndex] - newX)
              ? index
              : prevIndex;
          },
          activeItem,
        );

        setActiveItem(Math.min(newActiveIndex, maxActiveItem));
      }
    },
    [activeItem, setActiveItem, x, controls, positions, maxActiveItem],
  );

  useEffect(() => {
    handleResize();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [handleClick, handleResize, handleKeyDown, handleWheel, positions]);

  // Update position when activeItem changes
  useEffect(() => {
    controls.start({
      x: positions[activeItem],
      transition: TRANSITION_PROPS.spring,
    });
  }, [activeItem, controls, positions]);

  return (
    <VStack ref={node} spacing={5} alignItems='stretch'>
      <MotionFlex
        dragConstraints={node}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        drag='x'
        _active={{ cursor: 'grabbing' }}
        minWidth='min-content'
        flexWrap='nowrap'
        cursor='grab'
      >
        {children}
      </MotionFlex>
    </VStack>
  );
};

interface ItemProps {
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  trackIsActive: boolean;
  constraint: number;
  itemWidth: number;
  positions: number[];
  children: React.ReactNode;
  index: number;
  gap: number;
}

const Item = ({
  setTrackIsActive,
  setActiveItem,
  constraint,
  itemWidth,
  positions,
  children,
  index,
  gap,
}: ItemProps) => {
  const [userDidTab, setUserDidTab] = useState(false);

  const handleFocus = () => setTrackIsActive(true);

  const handleBlur = () => {
    userDidTab && index + 1 === positions.length && setTrackIsActive(false);
    setUserDidTab(false);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      const maxActiveItem = positions.length - constraint;
      if (index <= maxActiveItem) {
        setActiveItem(index);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) =>
    event.key === 'Tab' && setUserDidTab(true);

  return (
    <Flex
      className='item'
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      w={`${itemWidth}px`}
      _notLast={{
        mr: `${gap}px`,
      }}
      py='4px'
    >
      {children}
    </Flex>
  );
};
