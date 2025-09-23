import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { Flex, VStack } from '@chakra-ui/react';
import { TrackProps, DragEndInfo } from '../types';
import { TRANSITION_PROPS } from '../constants';

const MotionFlex = motion(Flex);

export const Track = ({
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

  const handleDragEnd = (_: Event, info: DragEndInfo) => {
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
        // transition:  TRANSITION_PROPS.ease,
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
    <VStack ref={node} gap={5} alignItems='stretch'>
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
