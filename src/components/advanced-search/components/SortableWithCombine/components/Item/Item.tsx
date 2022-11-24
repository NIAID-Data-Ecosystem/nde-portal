import React, { useEffect, useState } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { Handle } from './components/Handle';
import { Remove } from './components/Remove';
import type { DragItem, UnionTypes } from '../../types';
import { DropdownButton } from 'src/components/dropdown-button';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils';
import { Box, BoxProps, Flex } from 'nde-design-system';

export interface Props {
  activeIndex: number;
  data: DragItem;
  index: number;
  isMergeable: boolean;
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  fadeIn?: boolean;
  overIndex?: number;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style: BoxProps;
  transition?: string | null;
  wrapperStyle?: BoxProps;
  onUpdate?: (data: Partial<DragItem>) => void;
  onRemove?(): void;
  renderItem?: (props?: any) => JSX.Element | undefined;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        activeIndex,
        data,
        dragOverlay,
        dragging,
        handle,
        handleProps,
        index,
        isMergeable,
        listeners,
        onRemove,
        onUpdate,
        overIndex,
        renderItem,
        style,
        wrapperStyle,
      },
      ref,
    ) => {
      const [showActions, setShowActions] = useState(false);

      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';
        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return (
        <li
          ref={ref}
          style={{ flexDirection: 'inherit', alignItems: 'inherit' }}
        >
          <Flex
            id={`item-${data.id}`}
            onMouseOver={() => setShowActions(true)}
            onMouseOut={() => setShowActions(false)}
            h='100%'
            borderLeft='2px solid'
            borderRight='2px solid'
            borderLeftColor={
              index &&
              !isMergeable &&
              overIndex === index &&
              activeIndex > index
                ? '#D5D5D5'
                : 'transparent'
            }
            borderRightColor={
              index &&
              !isMergeable &&
              overIndex === index &&
              activeIndex < index
                ? '#D5D5D5'
                : 'transparent'
            }
            {...style}
          >
            {data.index !== 0 && data.value.union && !dragOverlay && (
              <Box m={1}>
                <DropdownButton
                  size='sm'
                  isDisabled={dragging}
                  ariaLabel='union between query elements'
                  onClick={() => {}}
                  options={unionOptions.map(term => {
                    return {
                      name: `${term}`,
                      value: term,
                      props: {
                        bg: getUnionTheme(term).bg,
                        _hover: getUnionTheme(term)._hover,
                        fontSize: 'xs',
                        textAlign: 'left',
                      },
                    };
                  })}
                  colorScheme={
                    data.value.union
                      ? getUnionTheme(data.value.union).colorScheme
                      : 'primary'
                  }
                  selectedOption={data.value.union}
                  setSelectedOption={union => {
                    onUpdate &&
                      onUpdate({
                        ...data,
                        value: { ...data.value, union: union as UnionTypes },
                      });
                  }}
                />
              </Box>
            )}

            <Box
              {...wrapperStyle}
              maxW={dragOverlay ? '400px' : 'unset'}
              maxH={dragOverlay ? '200px' : 'unset'}
              overflow={dragOverlay ? 'hidden' : 'unset'}
            >
              <Flex id={`content-data-${data.id}`}>
                {/* Handle for dragging the item. */}
                {handle ? (
                  <Handle
                    bg='transparent'
                    color='gray.600'
                    _hover={{ background: 'blackAlpha.100' }}
                    {...handleProps}
                    {...listeners}
                  />
                ) : null}

                {/* Content of draggable. */}
                {renderItem ? renderItem({ dragOverlay }) : <></>}

                {/* Close button */}
                <span>
                  {onRemove ? (
                    <Remove
                      aria-label={`remove item ${data.value.term}`}
                      onClick={onRemove}
                      color='gray.200'
                      bg='transparent'
                      p={1}
                      opacity={showActions ? 1 : 0}
                      colorScheme='gray'
                      _hover={{
                        bg: 'gray.100',
                        color: 'gray.600',
                      }}
                    />
                  ) : null}
                </span>
              </Flex>
            </Box>
          </Flex>
        </li>
      );
    },
  ),
);
