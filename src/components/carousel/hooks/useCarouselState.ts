import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { system } from 'src/theme';
import { PROGRESS_BAR_THRESHOLDS } from '../constants';

interface CarouselStateProps {
  children: React.ReactNode[];
  width: number;
  gap: number;
}

export const useCarouselState = ({
  children,
  width,
  gap,
}: CarouselStateProps) => {
  const [itemWidth, setItemWidth] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const [trackIsActive, setTrackIsActive] = useState(false);
  const [constraint, setConstraint] = useState(0);
  const [controlsWidth, setControlsWidth] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const breakpoints = system.breakpoints.values.reduce(
    (acc, breakpoint) => {
      acc[breakpoint.name] = `${breakpoint.min}`;
      return acc;
    },
    { base: '0rem' } as Record<string, string>,
  );

  const isBetweenBaseAndMd = useMediaQuery(
    `(min-width: ${breakpoints.base}) and (max-width: ${breakpoints.md})`,
  );
  const isBetweenMdAndXl = useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.xl})`,
  );
  const isGreaterThanXL = useMediaQuery(`(min-width: ${breakpoints.xl})`);

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

  // Check if the progress bar should be rendered
  useEffect(() => {
    if (itemWidth > 0) {
      const availableWidth = itemWidth;

      let shouldUseProgressBar = false;

      if (constraint === 1) {
        shouldUseProgressBar = totalDots > PROGRESS_BAR_THRESHOLDS.SINGLE_ITEM;
      } else if (constraint === 2) {
        shouldUseProgressBar = totalDots > PROGRESS_BAR_THRESHOLDS.TWO_ITEMS;
      } else if (constraint >= 3) {
        shouldUseProgressBar =
          totalDots > PROGRESS_BAR_THRESHOLDS.THREE_OR_MORE;
      }

      // Always render a progress bar if the screen is very narrow
      if (availableWidth < PROGRESS_BAR_THRESHOLDS.MIN_WIDTH) {
        shouldUseProgressBar = true;
      }

      setShowProgressBar(shouldUseProgressBar);
      setControlsWidth(availableWidth);
    }
  }, [itemWidth, totalDots, gap, constraint]);

  // Calculate progress percentage
  const progressPercentage =
    maxActiveItem > 0 ? (activeItem / maxActiveItem) * 100 : 0;

  return {
    itemWidth,
    activeItem,
    setActiveItem,
    trackIsActive,
    setTrackIsActive,
    constraint,
    controlsWidth,
    showProgressBar,
    positions,
    maxActiveItem,
    totalDots,
    progressPercentage,
  };
};
