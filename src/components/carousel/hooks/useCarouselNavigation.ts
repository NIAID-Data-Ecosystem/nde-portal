import { useCallback } from 'react';

interface CarouselNavigationProps {
  setActiveItem: React.Dispatch<React.SetStateAction<number>>;
  setTrackIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  constraint: number;
  maxActiveItem: number;
}

export const useCarouselNavigation = ({
  setActiveItem,
  setTrackIsActive,
  constraint,
  maxActiveItem,
}: CarouselNavigationProps) => {
  const handleFocus = useCallback(() => {
    setTrackIsActive(true);
  }, [setTrackIsActive]);

  const handleDecrementClick = useCallback(() => {
    setTrackIsActive(true);
    setActiveItem(prev => Math.max(0, prev - constraint));
  }, [setTrackIsActive, setActiveItem, constraint]);

  const handleIncrementClick = useCallback(() => {
    setTrackIsActive(true);
    setActiveItem(prev => Math.min(maxActiveItem, prev + constraint));
  }, [setTrackIsActive, setActiveItem, constraint, maxActiveItem]);

  const handleDotClick = useCallback(
    (index: number) => {
      const targetActiveItem = Math.min(index * constraint, maxActiveItem);
      setActiveItem(targetActiveItem);
    },
    [setActiveItem, constraint, maxActiveItem],
  );

  return {
    handleFocus,
    handleDecrementClick,
    handleIncrementClick,
    handleDotClick,
  };
};
