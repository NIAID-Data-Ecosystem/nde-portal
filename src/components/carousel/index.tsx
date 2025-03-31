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

const MotionFlex = motion(Flex);

const transitionProps = {
  type: 'spring',
  stiffness: 200,
  damping: 60,
  mass: 3,
};

const touchpadTransitionProps = {
  type: 'ease',
  ease: 'easeInOut',
  duration: 0.4,
};

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
  const ref = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({
    ref,
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

  const positions = useMemo(
    () =>
      children &&
      children.map((_, index) => -Math.abs((itemWidth + gap) * index)),
    [children, itemWidth, gap],
  );

  const [isBetweenBaseAndMd] = useMediaQuery(
    `(min-width: ${breakpoints.base}) and (max-width: ${breakpoints.md})`,
  );

  const [isBetweenMdAndXl] = useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.xl})`,
  );

  const [isGreaterThanXL] = useMediaQuery(`(min-width: ${breakpoints.xl})`);

  useEffect(() => {
    if (isBetweenBaseAndMd) {
      setItemWidth(width - gap);
      setConstraint(1);
    }
    if (isBetweenMdAndXl) {
      setItemWidth(width / 2 - gap);
      setConstraint(2);
    }
    if (isGreaterThanXL) {
      setItemWidth((children.length < 3 ? width / 2 : width / 3) - gap);
      setConstraint(children.length < 3 ? 2 : 3);
    }
  }, [
    isBetweenBaseAndMd,
    isBetweenMdAndXl,
    isGreaterThanXL,
    width,
    gap,
    children,
  ]);

  const itemProps = {
    setActiveItem,
    activeItem,
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
    itemWidth,
    positions,
  };

  // Handle arrow clicks
  const handleFocus = () => setTrackIsActive(true);

  const handleDecrementClick = () => {
    setTrackIsActive(true);
    !(activeItem === positions.length - positions.length) &&
      setActiveItem(prev => prev - constraint);
  };

  const handleIncrementClick = () => {
    setTrackIsActive(true);
    !(activeItem === positions.length - constraint) &&
      setActiveItem(prev => prev + constraint);
  };

  const handleDotClick = (index: number) => setActiveItem(index * constraint);

  return (
    <Flex ref={ref} direction='column' align='center'>
      <Box className='padded-carousel' w='100%' overflow='hidden' p={2}>
        <Track {...trackProps}>
          {children.map((child, index) => {
            return (
              <Item {...itemProps} index={index} key={index}>
                {child}
              </Item>
            );
          })}
        </Track>
        <Flex
          w={`${itemWidth}px`}
          mt={`${gap}px`}
          mx='auto'
          alignItems='center'
          justify='center'
        >
          <Button
            aria-label='previous carousel item'
            onClick={handleDecrementClick}
            onFocus={handleFocus}
            isDisabled={
              // disable the 'prev' button when there all items fit in view or at first index item
              children.length < constraint ||
              activeItem === positions.length - positions.length
            }
            mr={`${gap / 3}px`}
            color={`${colorScheme}.800`}
            variant='ghost'
            minW={0}
            size='sm'
          >
            <Icon as={FaAngleLeft} boxSize={4} />
          </Button>

          <Flex>
            {Array.from(
              {
                length: Math.ceil(
                  (children?.length || 1) / Math.max(constraint, 1),
                ),
              },
              (_, i) => (
                <Box
                  aria-label={`carousel indicator ${i}`}
                  key={i}
                  w={3}
                  h={3}
                  mx={1}
                  borderRadius='50%'
                  borderWidth='1px'
                  borderColor={`${colorScheme}.500`}
                  bg={
                    i === Math.floor(activeItem / constraint)
                      ? `${colorScheme}.500`
                      : '#ffffff'
                  }
                  cursor='pointer'
                  onClick={() => handleDotClick(i)}
                />
              ),
            )}
          </Flex>

          <Button
            aria-label='next carousel item'
            onClick={handleIncrementClick}
            onFocus={handleFocus}
            isDisabled={
              // disable the 'next' button when there all items fit in view or at last index item
              children.length < constraint ||
              activeItem === positions.length - constraint
            }
            ml={`${gap / 3}px`}
            color={`${colorScheme}.800`}
            variant='ghost'
            minW={0}
            size='sm'
          >
            <Icon as={FaAngleRight} boxSize={4} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

interface TrackProps {
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  trackIsActive: boolean;
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  activeItem: number;
  constraint: number;
  multiplier?: number;
  itemWidth: number;
  positions: number[];
  children: React.ReactNode;
}

const Track = ({
  setTrackIsActive,
  trackIsActive,
  setActiveItem,
  activeItem,
  constraint,
  multiplier = 0.35,
  itemWidth,
  positions,
  children,
}: TrackProps) => {
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const node = useRef<HTMLDivElement>(null);

  const handleDragStart = () => setDragStartPosition(positions[activeItem]);

  const handleDragEnd = (
    _: Event,
    info: {
      point: {
        x: number;
        y: number;
      };
      delta: {
        x: number;
        y: number;
      };
      offset: {
        x: number;
        y: number;
      };
      velocity: {
        x: number;
        y: number;
      };
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

    if (!(closestPosition < positions[positions.length - constraint])) {
      setActiveItem(positions.indexOf(closestPosition));
      controls.start({
        x: closestPosition,
        transition: {
          velocity: info.velocity.x,
          ...transitionProps,
        },
      });
    } else {
      setActiveItem(positions.length - constraint);
      controls.start({
        x: positions[positions.length - constraint],
        transition: {
          velocity: info.velocity.x,
          ...transitionProps,
        },
      });
    }
  };

  const handleResize = useCallback(
    () =>
      controls.start({
        x: positions[activeItem],
        transition: {
          ...transitionProps,
        },
      }),
    [activeItem, controls, positions],
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!node.current) return;
      return node.current.contains(event.target as Node)
        ? setTrackIsActive(true)
        : setTrackIsActive(false);
    },
    [setTrackIsActive],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (trackIsActive) {
        if (activeItem < positions.length - constraint) {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveItem(prev => prev + constraint);
          }
        }
        if (activeItem > positions.length - positions.length) {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveItem(prev => prev - constraint);
          }
        }
      }
    },
    [trackIsActive, setActiveItem, activeItem, constraint, positions.length],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;

      event.preventDefault();
      let newX = x.get() - event.deltaX;
      const minPosition = positions[0];
      const maxPosition = positions[positions.length - constraint];

      newX = Math.max(Math.min(newX, minPosition), maxPosition);

      x.set(newX);

      controls.start({
        x: newX,
        transition: touchpadTransitionProps,
      });

      const newActiveIndex = positions.reduce((prevIndex, _, index) => {
        return Math.abs(positions[index] - newX) <
          Math.abs(positions[prevIndex] - newX)
          ? index
          : prevIndex;
      }, activeItem);

      setActiveItem(newActiveIndex);
    },
    [activeItem, setActiveItem, x, controls, constraint, positions],
  );

  useEffect(() => {
    handleResize();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('wheel', handleWheel);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [handleClick, handleResize, handleKeyDown, handleWheel, positions]);

  return (
    <>
      {itemWidth ? (
        <VStack ref={node} spacing={5} alignItems='stretch'>
          <MotionFlex
            dragConstraints={node}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onWheel={handleWheel}
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
      ) : (
        <></>
      )}
    </>
  );
};

interface ItemProps extends TrackProps {
  index: number;
  gap: number;
}
const Item = ({
  setTrackIsActive,
  setActiveItem,
  activeItem,
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

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) =>
    event.key === 'Tab' &&
    !(activeItem === positions.length - constraint) &&
    setActiveItem(index);

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
