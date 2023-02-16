import React, { forwardRef, useMemo } from 'react';
import { Flex, Icon } from 'nde-design-system';
import { FaChevronDown } from 'react-icons/fa';
import { Action, Handle, Remove } from './Actions';
import { TreeItemProps } from '..';

interface TreeItemActionsProps
  extends Pick<
    TreeItemProps,
    'clone' | 'collapsed' | 'handleProps' | 'id' | 'onCollapse' | 'onRemove'
  > {
  children?: React.ReactNode;
}

export const TreeItemActions = React.memo(
  forwardRef<HTMLDivElement, TreeItemActionsProps>(
    ({ children, clone, collapsed, handleProps, id, onCollapse, onRemove }) => {
      const collapseIcon = useMemo(
        () => (
          <Icon
            as={FaChevronDown}
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
            color='niaid.placeholder'
          />

          {/* Collapse children items */}
          {!clone && onCollapse && (
            <Action
              id={id}
              aria-label='collapse items'
              handleClick={onCollapse}
              colorScheme='gray'
              variant='ghost'
              color='niaid.placeholder'
              mx={1}
              pl={1}
              pr={1}
              icon={collapseIcon}
            />
          )}

          {children}

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
  ),
);
