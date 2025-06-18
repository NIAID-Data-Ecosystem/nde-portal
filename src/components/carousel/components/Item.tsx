import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { ItemProps } from '../types';
const FALLBACK_ITEM_WIDTH = 200; // Fallback width for items
export const Item = ({
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
      w={`${itemWidth || FALLBACK_ITEM_WIDTH}px`}
      _notLast={{
        mr: `${gap}px`,
      }}
      py='4px'
    >
      {children}
    </Flex>
  );
};
