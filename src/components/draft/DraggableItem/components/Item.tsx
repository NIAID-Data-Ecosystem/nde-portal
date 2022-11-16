import React, { useEffect } from 'react';
import { Flex, Text } from 'nde-design-system';
import { DraggableAttributes, UniqueIdentifier } from '@dnd-kit/core';
import { AddWithUnion, AddWithUnionProps, options } from '../../buttons';
import { Handle } from './Handle';
import { Remove } from './Remove';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

export interface DragItem {
  id: UniqueIdentifier;
  field: string;
  value: string | typeof options[number];
}

export interface DraggableItemProps {
  id: DragItem['id'];
  value: DragItem['value'];
  property?: DragItem['field'];
  handle?: boolean;
  disabled?: boolean; //If you'd like to temporarily disable a sortable item, set the disabled argument to true.
  isDragging?: boolean;
  isOverlay?: boolean;
  handleProps?: {
    ref: (element: HTMLElement | null) => void;
  };
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
  onUpdate?: (data: Partial<DragItem>) => void;
  onRemove?: (id: UniqueIdentifier) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = props => {
  const {
    id,
    property,
    value,
    handle,
    disabled,
    isDragging,
    isOverlay,
    listeners,
    handleProps,
    attributes,
    onUpdate,
    onRemove,
    ...rest
  } = props;

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.body.style.cursor = 'grabbing';

    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const styles = {
    bg: 'white',
    borderRadius: 'semi',
    border: '1px solid',
    borderColor: 'gray.200',
    color: 'gray.600',
    colorScheme: 'gray',
    handle: {
      bg: 'white',
      color: 'primary.400',
      colorScheme: 'white',
      borderRight: '1px solid',
      borderRightColor: 'whiteAlpha.500',
      borderRadius: 'none',
      borderLeftRadius: 'semi',
    },
  };

  // styles for union type tag.
  if (property === 'union') {
    styles.bg = 'primary.500';
    styles.borderColor = 'primary.500';
    styles.color = 'white';
    styles.colorScheme = 'primary';
  }

  return (
    <Flex
      id='drag-item'
      m={1}
      px={handle ? 0 : 4}
      py={handle ? 0 : 2}
      opacity={!isDragging || isOverlay ? 1 : 0.5}
      transform={isOverlay ? 'scale(1.1)' : 'scale(1)'}
      boxShadow={isOverlay ? 'base' : isDragging ? 'none' : 'low'}
      // only show removal when hovered.
      sx={{
        '.remove-tag': {
          width: '0rem',
          visibility: 'hidden',
          overflow: 'hidden',
          // padding: 'none',
          transition: 'all 0.2s linear',
        },
      }}
      _hover={{
        '.remove-tag': {
          width: '2rem',
          visibility: 'visible',
          overflow: 'hidden',
          transition: 'all 0.2s linear',
          mr: 2,
        },
      }}
      {...styles}
    >
      {/* Handle used for dragging tags */}
      {handle ? (
        <Handle
          cursor={isDragging ? 'grabbing' : ''}
          aria-label='Handle to move tag'
          {...styles.handle}
          {...handleProps}
          {...listeners}
          {...attributes}
        />
      ) : null}
      {property === 'union' ? (
        <AddWithUnion
          ariaLabel='Join two query terms'
          size='sm'
          type='button'
          unionType={value as AddWithUnionProps['unionType']}
          setUnionType={value => {
            onUpdate && onUpdate({ value });
          }}
          zIndex='popover'
          height='100%'
        ></AddWithUnion>
      ) : (
        <Flex flexDirection='column' justifyContent='center' px={2} pr={4}>
          <Text fontSize='12px' lineHeight='short'>
            {property || ' '}
          </Text>
          {/* eventually turn into input field/add handle? */}
          <Text fontSize='sm' lineHeight='short' fontWeight='medium'>
            {value}
          </Text>
        </Flex>
      )}
      {onRemove ? (
        <Remove
          h='100%'
          onClick={onRemove}
          aria-label='Remove tag'
          colorScheme={styles.colorScheme}
          color={styles.color}
        />
      ) : null}
    </Flex>
  );
};
