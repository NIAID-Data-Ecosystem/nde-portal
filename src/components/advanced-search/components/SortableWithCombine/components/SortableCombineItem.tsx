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
  handle: boolean;
  data: DragItem;
  wrapperStyle?({
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
  onUpdate?: (data: DragItem) => void;
  style: SortableWithCombineProps['getItemStyles'];
  renderItem?: (props: any) => JSX.Element | undefined;
}

export function SortableCombineItem({
  disabled,
  animateLayoutChanges,
  handle,
  id,
  data,
  index,
  style,
  onRemove,
  onUpdate,
  renderItem,
  isMergeable,
  useDragOverlay,
  wrapperStyle,
  ...rest
}: SortableItemProps) {
  const {
    activeIndex,
    attributes,
    isDragging,
    isSorting,
    listeners,
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

  // Check if this element is mergeable.
  const isAvailableForMerge = (isMergeable && over && over.id === id) || false;
  return (
    <Item
      ref={setNodeRef}
      data={data}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      renderItem={args =>
        renderItem &&
        renderItem({
          ...args,
          id,
          data,
          handle,
          index,
          wrapperStyle,
          isMergeable,
          style,
          onUpdate,
          onRemove,
          useDragOverlay,
        })
      }
      index={index}
      isMergeable={isAvailableForMerge}
      overIndex={overIndex}
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
                isMergeable: isAvailableForMerge,
                isDragOverlay: true,
              }),
              transform: CSS.Translate.toString(transform),
              transition,
            }
          : undefined
      }
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onUpdate={
        onUpdate
          ? (update: Partial<DragItem>) => onUpdate({ ...data, ...update })
          : undefined
      }
      wrapperStyle={
        wrapperStyle &&
        wrapperStyle({
          index,
          isDragging,
          isMergeable: isAvailableForMerge,
          id,
          data,
        })
      }
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
      {...rest}
    />
  );
}
