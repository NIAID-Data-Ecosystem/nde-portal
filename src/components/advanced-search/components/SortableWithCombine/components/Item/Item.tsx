import React, { useEffect, useState } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import { Handle } from './components/Handle';
import { Remove } from './components/Remove';
import type { DragItem } from '../../types';
import { DropdownButton } from 'src/components/dropdown-button';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils';
import { textAlign } from 'styled-system';
import { Box } from 'nde-design-system';

export interface Props {
  dragOverlay?: boolean;
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  color?: string;
  data: DragItem;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  isMergeable: boolean;
  fadeIn?: boolean;
  activeIndex: number;
  newIndex: number;
  overIndex: number;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  onUpdate?: (data: Partial<DragItem>) => void;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props['transform'];
    transition: Props['transition'];
    value: Props['value'];
  }): React.ReactElement;
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
        height,
        index,
        isMergeable,
        listeners,
        newIndex,
        onRemove,
        onUpdate,
        overIndex,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref,
    ) => {
      const [showTagOptions, setShowTagOptions] = useState(false);
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';
        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <div
          ref={ref}
          id={`item-${data.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            borderLeft: '2px solid',
            borderRight: '2px solid',
            borderLeftColor:
              !isMergeable && overIndex === index && activeIndex > index
                ? '#D5D5D5'
                : 'transparent',
            borderRightColor:
              !isMergeable && overIndex === index && activeIndex < index
                ? '#D5D5D5'
                : 'transparent',
            ...style,
          }}
          onMouseOver={() => setShowTagOptions(true)}
          onMouseOut={() => setShowTagOptions(false)}
        >
          {data.value.union && !dragOverlay && (
            <Box mr={1}>
              <DropdownButton
                size='sm'
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
                    onUpdate({ ...data, value: { ...data.value, union } });
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
              {handle ? (
                <Handle
                  bg='white'
                  color='gray.600'
                  _hover={{ background: 'blackAlpha.100' }}
                  {...handleProps}
                  {...listeners}
                />
              ) : null}
              <div style={{ display: 'flex', flex: 1, padding: '0.5rem' }}>
                {children || value}
              </div>
              <span>
                {onRemove ? (
                  <Remove
                    onClick={onRemove}
                    color='gray.200'
                    bg='transparent'
                    p={1}
                    opacity={showTagOptions ? 1 : 0}
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
        </div>
      );
    },
  ),
);
