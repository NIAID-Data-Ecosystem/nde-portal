import React, { useEffect, useMemo } from 'react';
import {
  Button,
  ButtonProps,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverContentProps,
  PopoverHeader,
  PopoverProps,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { FaSliders } from 'react-icons/fa6';
import { useSelectableList } from '../hooks/useSelectableList';
import { usePopoverSearch } from '../hooks/usePopoverSearch';
import { PopoverSearchInput } from './PopoverSearchInput';
import { PopoverSelectAll } from './PopoverSelectAll';
import { PopoverSelectableList } from './PopoverSelectableList';
import type { PopoverItem } from '../types';

export interface SelectAndSortPopoverCopy {
  /** Trigger button label. Default: 'Customize'. */
  button?: string;
  /** Popover header title. Default: 'Customize'. */
  header?: string;
  /** Subtitle below the header. Default: 'Select items to display.'. */
  description?: string;
  /** Search-input placeholder. Default: 'Search'. */
  searchPlaceholder?: string;
  /** Empty-state message. Default: 'No items found'. */
  noItemsFound?: string;
  /** Select-all button label. Default: 'Select All'. */
  selectAll?: string;
  /** Clear-all button label. Default: 'Clear All'. */
  clearAll?: string;
}

export interface SelectAndSortPopoverProps {
  /** Items to display. Set `groupKey` on items to enable grouped rendering. */
  items: PopoverItem[];

  /**
   * localStorage key for persisting selection. Pass `null` to opt out of
   * persistence.
   */
  storageKeyVisible: string | null;

  /**
   * localStorage key for persisting order. Required only when
   * `enableOrdering` is true. Pass `null` to opt out of persistence.
   */
  storageKeyOrder?: string | null;

  /** IDs selected by default when no persisted value exists. Defaults to all IDs. */
  defaultVisibleIds?: string[];

  /** IDs that cannot be deselected and (when ordering) stay pinned at top. */
  requiredIds?: readonly string[];

  /** Enables drag-and-drop and up/down reordering. Default: false. */
  enableOrdering?: boolean;

  /**
   * Force grouped or flat rendering. When omitted, grouping is auto-detected
   * from whether any item carries a `groupKey`.
   */
  enableGrouping?: boolean;

  /** Called whenever the visible-IDs set changes. */
  onVisibleChange?: (visibleIds: string[]) => void;

  /** Called whenever the display order changes. Only fires when ordering is enabled. */
  onOrderChange?: (orderedIds: string[]) => void;

  /** Override any of the default UI strings. */
  copy?: SelectAndSortPopoverCopy;

  /** Show the `(selected/total)` count next to the trigger label. Default: true. */
  showCount?: boolean;

  /** Show the search input inside the popover. Default: true. */
  showSearch?: boolean;

  /** Show the select-all/clear-all toggle. Default: true. */
  showSelectAll?: boolean;

  /** Override props on the trigger button (color scheme, size, layout, etc.). */
  triggerProps?: Omit<ButtonProps, 'children'>;

  /** Forwarded to Chakra's `Popover`. */
  popoverProps?: Omit<PopoverProps, 'children'>;

  /** Forwarded to Chakra's `PopoverContent` (sizing, etc.). */
  popoverContentProps?: PopoverContentProps;

  /** Max height of the scrollable list area. Defaults to PopoverSelectableList's default. */
  maxListHeight?: string;
}

const DEFAULT_COPY: Required<SelectAndSortPopoverCopy> = {
  button: 'Customize',
  header: 'Customize',
  description: 'Select items to display.',
  searchPlaceholder: 'Search',
  noItemsFound: 'No items found',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

/**
 * Generic popover for selecting (and optionally reordering) a set of items.
 * Used to power both the search-filters customization popover and the
 * repository-matcher column customization popover. Wrap with a
 * context-specific component to pre-fill storage keys, copy, and defaults.
 */
export const SelectAndSortPopover = ({
  items,
  storageKeyVisible,
  storageKeyOrder,
  defaultVisibleIds,
  requiredIds = [],
  enableOrdering = false,
  enableGrouping,
  onVisibleChange,
  onOrderChange,
  copy: copyOverrides,
  showCount = true,
  showSearch = true,
  showSelectAll = true,
  triggerProps,
  popoverProps,
  popoverContentProps,
  maxListHeight,
}: SelectAndSortPopoverProps) => {
  const copy = { ...DEFAULT_COPY, ...copyOverrides };

  const allIds = useMemo(() => items.map(i => i.id), [items]);

  // Auto-detect grouping unless explicitly overridden.
  const useGrouping = enableGrouping ?? items.some(i => Boolean(i.groupKey));

  const {
    selectedIds,
    order,
    isReady,
    toggle,
    toggleAll,
    moveUp,
    moveDown,
    handleDragEnd,
  } = useSelectableList({
    items,
    requiredIds: requiredIds as string[],
    enableOrdering,
    storageKeyVisible,
    storageKeyOrder,
    defaultVisibleIds,
  });

  // Notify parent when visibility changes.
  useEffect(() => {
    if (!isReady) return;
    onVisibleChange?.(selectedIds);
  }, [selectedIds, isReady, onVisibleChange]);

  // Notify parent when order changes (ordering mode only).
  useEffect(() => {
    if (!isReady || !order) return;
    onOrderChange?.(order);
  }, [order, isReady, onOrderChange]);

  // When ordering is enabled, render items in their current order so search
  // filtering preserves that order.
  const orderedItems = useMemo<PopoverItem[]>(() => {
    if (!order) return items;
    return order
      .map(id => items.find(i => i.id === id))
      .filter((i): i is PopoverItem => Boolean(i));
  }, [order, items]);

  const {
    searchTerm,
    setSearchTerm,
    isSearching,
    filteredItems,
    filteredGroups,
  } = usePopoverSearch({ items: orderedItems });

  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;
  const allSelected = selectedCount === totalCount;

  return (
    <Popover placement='bottom-end' isLazy {...popoverProps}>
      <PopoverTrigger>
        <Button
          colorScheme='primary'
          variant='outline'
          size='sm'
          leftIcon={<Icon as={FaSliders} boxSize={3.5} />}
          {...triggerProps}
        >
          <Text
            as='span'
            color='inherit'
            display={{ base: 'none', sm: 'inline' }}
          >
            {copy.button}
          </Text>
          {showCount ? ` (${selectedCount}/${totalCount})` : ''}
        </Button>
      </PopoverTrigger>

      <PopoverContent minW='280px' maxW='320px' {...popoverContentProps}>
        <PopoverArrow />
        <PopoverCloseButton />

        <PopoverHeader fontWeight='semibold'>
          <Text>{copy.header}</Text>
          <Text fontSize='sm' fontWeight='normal'>
            {copy.description}
          </Text>
          {showSelectAll && (
            <PopoverSelectAll
              allSelected={allSelected}
              totalCount={totalCount}
              onToggle={toggleAll}
              selectAllLabel={copy.selectAll}
              clearAllLabel={copy.clearAll}
            />
          )}
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          {showSearch && (
            <PopoverSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={copy.searchPlaceholder}
            />
          )}

          <PopoverSelectableList
            items={filteredItems}
            groups={useGrouping ? filteredGroups : undefined}
            selectedIds={selectedIds}
            requiredIds={requiredIds as string[]}
            enableOrdering={enableOrdering}
            isSearching={isSearching}
            orderedIds={order}
            onCheck={toggle}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onDragEnd={handleDragEnd}
            emptyMessage={copy.noItemsFound}
            maxHeight={maxListHeight}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
