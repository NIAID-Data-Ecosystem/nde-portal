import React, { useEffect } from 'react';
import { Box, Text } from 'nde-design-system';
import { UniqueIdentifier } from '@dnd-kit/core';

export interface DragItem {
  id: UniqueIdentifier;
  field: string;
  value: string;
}

export interface DraggableItemProps {
  id: UniqueIdentifier;
  property?: string;
  value: string; // change to type of items.value in parent state.
  handle?: boolean;
  disabled?: boolean; //If you'd like to temporarily disable a sortable item, set the disabled argument to true.
  isDragging?: boolean;
  isOverlay?: boolean;
  // [TO DO]: add below.
  // removeItem
  // updateItem
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  property,
  value,
  handle,
  disabled,
  isDragging,
  isOverlay,
}) => {
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.body.style.cursor = 'grabbing';

    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <Box
      id='drag-item'
      m={1}
      px={4}
      py={2}
      borderRadius='semi'
      bg='white'
      border='1px solid'
      borderColor='gray.200'
      opacity={!isDragging || isOverlay ? 1 : 0.5}
      transform={isOverlay ? 'scale(1.1)' : 'scale(1)'}
      boxShadow={isOverlay ? 'base' : isDragging ? 'none' : 'low'}
    >
      {/* <Tag/> */}
      {property && <Text fontSize='xs'>{property}</Text>}
      {/* eventually turn into input field/add handle? */}
      <Text fontSize='md'>{value}</Text>
    </Box>
  );
};
