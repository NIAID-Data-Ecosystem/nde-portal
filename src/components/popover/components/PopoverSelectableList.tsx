import React, { useMemo } from 'react';
import { Stack, Text } from '@chakra-ui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PopoverItem, PopoverItemGroup } from '../types';
import { PopoverListItem } from './PopoverListItem';
import { PopoverEmptyState } from './PopoverEmptyState';

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

interface RenderItemsProps {
  items: PopoverItem[];
  selectedIds: string[];
  requiredIds: string[];
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
      const movableIdx = movableIds.indexOf(item.id);
      return (
        <PopoverListItem
          key={item.id}
          item={item}
          isChecked={selectedIds.includes(item.id)}
          isRequired={isRequired}
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
            <Text fontSize='xs' fontWeight='semibold' color='gray.800' px={1}>
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
        onDragEnd={onDragEnd ?? (() => {})}
      >
        <SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
          {listBody}
        </SortableContext>
      </DndContext>
    </Stack>
  );
};
