import React, { useMemo } from 'react';
import { Flex, Icon } from '@chakra-ui/react';
import { FaAngleDown, FaRegPenToSquare } from 'react-icons/fa6';
import { Action, Handle, Remove } from './Actions';
import { TreeItemComponentProps } from '..';
import { UniqueIdentifier } from '@dnd-kit/core';

interface TreeItemActionsProps
  extends Pick<
    TreeItemComponentProps,
    'clone' | 'collapsed' | 'handleProps' | 'id' | 'onCollapse' | 'onRemove'
  > {
  children?: React.ReactNode;
  onUpdate?: (id: UniqueIdentifier) => void;
}

export const TreeItemActions = React.memo(
  ({
    children,
    clone,
    collapsed,
    handleProps,
    id,
    onCollapse,
    onRemove,
    onUpdate,
  }: TreeItemActionsProps) => {
    const collapseIcon = useMemo(
      () => (
        <Icon
          as={FaAngleDown}
          boxSize={3}
          transition='transform 250ms ease'
          transform={collapsed ? `rotate(-90deg)` : `rotate(0deg)`}
        />
      ),
      [collapsed],
    );

    return (
      <Flex className='actions' flex={1}>
        {/* Drag handle used to move item */}
        <Handle
          {...handleProps}
          aria-label='drag item'
          className='tree-item-handle'
          color='page.placeholder'
        />

        {/* Collapse children items */}
        {!clone && onCollapse && (
          <Action
            id={id}
            aria-label='collapse items'
            handleClick={onCollapse}
            colorScheme='gray'
            variant='ghost'
            color='page.placeholder'
            mx={1}
            icon={collapseIcon}
          />
        )}

        <Flex flex={1}>{children}</Flex>

        {!clone && onUpdate && (
          <Action
            id={id}
            aria-label='collapse items'
            handleClick={onUpdate}
            colorScheme='gray'
            variant='ghost'
            color='page.placeholder'
            mx={1}
            icon={<Icon as={FaRegPenToSquare} />}
          />
        )}
        {/* Button to delete item. */}
        {!clone && onRemove && (
          <Remove
            id={id}
            className='remove'
            handleClick={onRemove}
            aria-label='remove item'
          />
        )}
      </Flex>
    );
  },
);
