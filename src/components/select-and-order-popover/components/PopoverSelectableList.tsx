import { Stack, Text } from '@chakra-ui/react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useMemo } from 'react';

import { PopoverItem, PopoverItemGroup } from '../types';
import { PopoverEmptyState } from './PopoverEmptyState';
import { PopoverListItem } from './PopoverListItem';

interface PopoverSelectableListProps {
  /**
   * Items to display.  When `enableOrdering` is true these should already be
   * in the desired display order (i.e., derived from the `order` array in
   * `useSelectableList`).
   */
  items: PopoverItem[];

  /** Groups produced by `usePopoverSearch`.  When provided, items are rendered under headings. */
  groups?: PopoverItemGroup[];

  selectedIds: string[];
  requiredIds?: string[];
  /**
   * IDs only restored as a fallback when the visible set would otherwise
   * be empty. Rendered with a "(shown by default)" label. Unlike
   * `requiredIds`, these stay individually checkable/movable.
   */
  fallbackIds?: string[];

  enableOrdering?: boolean;
  isSearching?: boolean;

  /** Full ordered list of all IDs */
  orderedIds?: string[];

  onCheck: (id: string, checked: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDragEnd?: (event: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => void;

  emptyMessage?: string;

  /** Max height of the scrollable list area. Defaults to '20rem'. */
  maxHeight?: string;
}

/**
 * Keeps the dragged row on the vertical axis and inside the list's visible
 * area.
 *
 * dnd-kit moves the row with a transform, and a transformed row past the
 * scroller's edge enlarges the scroller's overflow. Auto-scroll then scrolls
 * into that new overflow, and dnd-kit adds the scrolled distance to the row's
 * transform to keep it under the pointer. That pushes the row further out and
 * grows the overflow again, so the list scrolls forever, on both axes
 * (`overflowY: auto` makes `overflowX` auto too). Clamping the row to the
 * scroller stops the loop. Auto-scroll still runs while the pointer is near an
 * edge, so rows outside the visible area can still be reached.
 */
export const restrictToList: Modifier = ({
  transform,
  draggingNodeRect,
  scrollableAncestorRects,
}) => {
  // The nearest scrollable ancestor: this list, or whatever scrolls it.
  const bounds = scrollableAncestorRects[0];
  if (!draggingNodeRect || !bounds) return { ...transform, x: 0 };

  const minY = bounds.top - draggingNodeRect.top;
  const maxY = bounds.bottom - draggingNodeRect.bottom;
  return {
    ...transform,
    x: 0,
    y: Math.min(Math.max(transform.y, minY), maxY),
  };
};

const DND_MODIFIERS = [restrictToList];

interface RenderItemsProps {
  items: PopoverItem[];
  selectedIds: string[];
  requiredIds: string[];
  fallbackIds: string[];
  enableOrdering: boolean;
  isSearching: boolean;
  movableIds: string[];
  onCheck: (id: string, checked: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

const RenderItems = ({
  items,
  selectedIds,
  requiredIds,
  fallbackIds,
  enableOrdering,
  isSearching,
  movableIds,
  onCheck,
  onMoveUp,
  onMoveDown,
}: RenderItemsProps) => (
  <>
    {items.map(item => {
      const isRequired = requiredIds.includes(item.id);
      const isFallback = !isRequired && fallbackIds.includes(item.id);
      const movableIdx = movableIds.indexOf(item.id);
      return (
        <PopoverListItem
          key={item.id}
          item={item}
          isChecked={selectedIds.includes(item.id)}
          isRequired={isRequired}
          isFallback={isFallback}
          enableOrdering={enableOrdering}
          isSearching={isSearching}
          isFirst={isRequired || movableIdx === 0}
          isLast={!isRequired && movableIdx === movableIds.length - 1}
          onCheck={onCheck}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      );
    })}
  </>
);

/**
 * Scrollable, selectable (and optionally orderable) list for use inside
 * Chakra UI popovers.
 *
 * Pass `groups` to render items under category headings; omit it for a flat list.
 * Pass `enableOrdering={true}` to activate drag-and-drop and up/down buttons.
 */
export const PopoverSelectableList = ({
  items,
  groups,
  selectedIds,
  requiredIds = [],
  fallbackIds = [],
  enableOrdering = false,
  isSearching = false,
  orderedIds,
  onCheck,
  onMoveUp,
  onMoveDown,
  onDragEnd,
  emptyMessage,
  maxHeight = '20rem',
}: PopoverSelectableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // IDs available for up/down movement (excludes required ones).
  const movableIds = useMemo(
    () =>
      (orderedIds ?? items.map(i => i.id)).filter(
        id => !requiredIds.includes(id),
      ),
    [orderedIds, items, requiredIds],
  );

  const isEmpty = items.length === 0;
  const useGroups = Boolean(groups && groups.length > 0);

  const dndIds =
    enableOrdering && !isSearching ? orderedIds ?? items.map(i => i.id) : [];

  const itemProps = {
    selectedIds,
    requiredIds,
    fallbackIds,
    enableOrdering,
    isSearching,
    movableIds,
    onCheck,
    onMoveUp,
    onMoveDown,
  };

  const listBody = isEmpty ? (
    <PopoverEmptyState message={emptyMessage} />
  ) : useGroups ? (
    // Grouped rendering
    <>
      {groups!.map(group => (
        <Stack
          key={group.groupKey}
          gap={0.5}
          borderBottom='1px solid'
          borderColor='gray.100'
          px={2}
          py={1}
        >
          {group.groupKey && (
            <Text fontSize='xs' fontWeight='semibold' color='gray.600' px={1}>
              {group.groupKey}
            </Text>
          )}
          <RenderItems items={group.items} {...itemProps} />
        </Stack>
      ))}
    </>
  ) : (
    // Flat rendering
    <Stack gap={0} px={0} py={1}>
      <RenderItems items={items} {...itemProps} />
    </Stack>
  );

  return (
    <Stack gap={0} px={0} py={1} maxHeight={maxHeight} overflowY='auto'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={DND_MODIFIERS}
        onDragEnd={onDragEnd ?? (() => {})}
      >
        <SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
          {listBody}
        </SortableContext>
      </DndContext>
    </Stack>
  );
};
