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
  theme,
  useMediaQuery,
  VStack,
} from 'nde-design-system';
import { useElementSize } from 'usehooks-ts';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Progress } from '@chakra-ui/react';

const MotionFlex = motion(Flex);

const transitionProps = {
  stiffness: 200,
  type: 'spring',
  damping: 60,
  mass: 3,
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
  const [ref, { width }] = useElementSize();
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
      setItemWidth(width / 3 - gap);
      setConstraint(3);
    }
  }, [isBetweenBaseAndMd, isBetweenMdAndXl, isGreaterThanXL, width, gap]);

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
      setActiveItem(prev => prev - 1);
  };

  const handleIncrementClick = () => {
    setTrackIsActive(true);
    !(activeItem === positions.length - constraint) &&
      setActiveItem(prev => prev + 1);
  };

  return (
    <Flex ref={ref}>
      <Box w='100%' overflow='hidden'>
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
        >
          <Button
            onClick={handleDecrementClick}
            onFocus={handleFocus}
            isDisabled={activeItem === positions.length - positions.length}
            mr={`${gap / 3}px`}
            color={`${colorScheme}.800`}
            variant='ghost'
            minW={0}
            size='sm'
          >
            <Icon as={FaChevronLeft} boxSize={4} />
          </Button>

          <Progress
            value={100 / ((positions.length - constraint) / activeItem)}
            alignSelf='center'
            borderRadius='2px'
            bg={`${colorScheme}.200`}
            flex={1}
            h='3px'
            sx={{
              '> div': {
                backgroundColor: `${colorScheme}.400`,
              },
            }}
          />

          <Button
            onClick={handleIncrementClick}
            onFocus={handleFocus}
            isDisabled={activeItem === positions.length - constraint}
            ml={`${gap / 3}px`}
            color={`${colorScheme}.800`}
            variant='ghost'
            minW={0}
            size='sm'
          >
            <Icon as={FaChevronRight} boxSize={4} />
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
            setActiveItem(prev => prev + 1);
          }
        }
        if (activeItem > positions.length - positions.length) {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveItem(prev => prev - 1);
          }
        }
      }
    },
    [trackIsActive, setActiveItem, activeItem, constraint, positions.length],
  );

  useEffect(() => {
    handleResize();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick, handleResize, handleKeyDown, positions]);

  return (
    <>
      {itemWidth ? (
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
