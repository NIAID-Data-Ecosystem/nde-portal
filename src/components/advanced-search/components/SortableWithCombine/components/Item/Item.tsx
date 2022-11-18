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
import { Box } from 'nde-design-system';

export interface Props {
  activeIndex: number;
  data: DragItem;
  isMergeable: boolean;
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  overIndex?: number;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  onUpdate?: (data: Partial<DragItem>) => void;
  onRemove?(): void;
  renderItem?: (props?: any) => JSX.Element | undefined;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        activeIndex,
        children,
        color,
        data,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
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
        transition,
        transform,
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
          id={`item-${data.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            borderLeft: '2px solid',
            borderRight: '2px solid',
            borderLeftColor:
              index &&
              !isMergeable &&
              overIndex === index &&
              activeIndex > index
                ? '#D5D5D5'
                : 'transparent',
            borderRightColor:
              index &&
              !isMergeable &&
              overIndex === index &&
              activeIndex < index
                ? '#D5D5D5'
                : 'transparent',
            ...style,
          }}
          onMouseOver={() => setShowActions(true)}
          onMouseOut={() => setShowActions(false)}
        >
          {data.value.union && !dragOverlay && (
            <Box mr={1}>
              <DropdownButton
                size='sm'
                ariaLabel='union betwee n query elements'
                onClick={() => {}}
                options={unionOptions.map(term => {
                  return {
                    name: `${term}`,
                    value: term,
                    props: {
                      ...getUnionTheme(term),
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
          <div
            style={
              {
                ...wrapperStyle,
                transition: [transition, wrapperStyle?.transition]
                  .filter(Boolean)
                  .join(', '),
                '--translate-x': transform
                  ? `${Math.round(transform.x)}px`
                  : undefined,
                '--translate-y': transform
                  ? `${Math.round(transform.y)}px`
                  : undefined,
                '--scale-x': transform?.scaleX
                  ? `${transform.scaleX}`
                  : undefined,
                '--scale-y': transform?.scaleY
                  ? `${transform.scaleY}`
                  : undefined,
                '--index': index,
                '--color': color,
              } as React.CSSProperties
            }
          >
            <div id={`content-data-${data.id}`} style={{ display: 'flex' }}>
              {/* Handle for dragging the item. */}
              {handle ? (
                <Handle
                  bg='white'
                  color='gray.600'
                  _hover={{ background: 'blackAlpha.100' }}
                  {...handleProps}
                  {...listeners}
                />
              ) : null}

              {/* Content of draggable. */}
              {renderItem ? renderItem() : <></>}

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
            </div>
          </div>
        </li>
      );
    },
  ),
);
