import React from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable, AnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from './Item';
import type {
  DragItem,
  SortableWithCombineProps,
  WrapperStylesProps,
} from '../types';

export interface SortableItemProps {
  id: UniqueIdentifier;
  index: number;
  children?: React.ReactElement;
  handle: boolean;
  data: DragItem;
  wrapperStyle({
    index,
    isDragging,
    id,
    data,
  }: WrapperStylesProps): React.CSSProperties;
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  isOverlay?: boolean;
  isMergeable: boolean;
  useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  style: SortableWithCombineProps['getItemStyles'];
  renderItem?(args: any): React.ReactElement;
}

export function SortableCombineItem({
  children,
  disabled,
  animateLayoutChanges,
  handle,
  id,
  data,
  index,
  style,
  onRemove,
  renderItem,
  isMergeable: shouldMerge,
  useDragOverlay,
  wrapperStyle,
}: SortableItemProps) {
  const {
    active,
    activeIndex,
    attributes,
    isDragging,
    isSorting,
    items,
    listeners,
    newIndex,
    over,
    overIndex,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
  });

  const isMergeable = (shouldMerge && over && over.id === id) || false;
  return (
    <Item
      ref={setNodeRef}
      value={id}
      data={data}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      renderItem={renderItem}
      index={index}
      isMergeable={isMergeable}
      overIndex={overIndex}
      newIndex={newIndex}
      activeIndex={activeIndex}
      style={
        style
          ? {
              ...style({
                index,
                id,
                data,
                isDragging,
                isSorting,
                overIndex,
                isMergeable,
                isDragOverlay: true,
              }),
              transform: CSS.Translate.toString(transform),
              transition,
            }
          : undefined
      }
      onRemove={onRemove ? () => onRemove(id) : undefined}
      wrapperStyle={wrapperStyle({ index, isDragging, isMergeable, id, data })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
    >
      {children || <></>}
    </Item>
  );
}
