import React, { useEffect, useMemo } from 'react';
import {
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { FaSliders } from 'react-icons/fa6';
import {
  useSelectableList,
  usePopoverSearch,
  PopoverSearchInput,
  PopoverSelectAll,
  PopoverSelectableList,
} from 'src/components/select-and-order-popover';
import type { PopoverItem } from 'src/components/select-and-order-popover';

export interface ColumnConfig {
  id: string;
  title: string;
}

export interface CustomizeColumnsPopoverCopy {
  /** Label on the trigger button. Defaults to 'Customize Columns'. */
  button?: string;
  /** Popover header title. Defaults to 'Customize Columns'. */
  header?: string;
  /** Descriptive subtitle below the header. Defaults to 'Select and reorder columns to display.' */
  description?: string;
  /** Placeholder text for the search input. Defaults to 'Search columns'. */
  searchPlaceholder?: string;
  /** Message shown when the search returns no results. Defaults to 'No columns found'. */
  noColumnsFound?: string;
  /** Label for the select-all button. Defaults to 'Select All'. */
  selectAll?: string;
  /** Label for the clear-all button. Defaults to 'Clear All'. */
  clearAll?: string;
}

interface CustomizeColumnsPopoverProps {
  /** Full list of columns available for selection. */
  columnsList: ColumnConfig[];
  /**
   * localStorage key used to persist which column IDs are visible.
   * Must be unique per table type.
   */
  storageKeyVisible: string;
  /**
   * localStorage key used to persist the column display order.
   * Must be unique per table type.
   */
  storageKeyOrder: string;
  /**
   * Column IDs visible by default (before the user makes any changes).
   */
  defaultVisibleIds: string[];
  /**
   * Column IDs that cannot be hidden. These are always checked and the
   * checkbox is disabled so users cannot toggle them off.
   */
  requiredIds: readonly string[] | string[];
  /** Called whenever the set of visible column IDs changes. */
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  /** Called whenever the column display order changes. */
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
  /** Optional overrides for the UI copy strings. */
  copy?: CustomizeColumnsPopoverCopy;
}

const DEFAULT_COPY: Required<CustomizeColumnsPopoverCopy> = {
  button: 'Customize Columns',
  header: 'Customize Columns',
  description: 'Select and reorder columns to display.',
  searchPlaceholder: 'Search columns',
  noColumnsFound: 'No columns found',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

export const CustomizeColumnsPopover = ({
  columnsList,
  storageKeyVisible,
  storageKeyOrder,
  defaultVisibleIds,
  requiredIds,
  onVisibleColumnsChange,
  onColumnOrderChange,
  copy: copyOverrides,
}: CustomizeColumnsPopoverProps) => {
  const copy = { ...DEFAULT_COPY, ...copyOverrides };

  // Map ColumnConfig => PopoverItem (columns are flat, no groupKey needed).
  const items = useMemo<PopoverItem[]>(
    () => columnsList.map(({ id, title }) => ({ id, title })),
    [columnsList],
  );

  const allIds = useMemo(() => items.map(i => i.id), [items]);

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
    enableOrdering: true,
    storageKeyVisible,
    storageKeyOrder,
    defaultVisibleIds,
  });

  // Notify parent when visibility changes.
  useEffect(() => {
    if (!isReady) return;
    onVisibleColumnsChange?.(selectedIds);
  }, [selectedIds, isReady, onVisibleColumnsChange]);

  // Notify parent when order changes.
  useEffect(() => {
    if (!isReady || !order) return;
    onColumnOrderChange?.(order);
  }, [order, isReady, onColumnOrderChange]);

  // Display items in their current order (search filters within that order).
  const orderedItems = useMemo<PopoverItem[]>(() => {
    if (!order) return items;
    return order
      .map(id => items.find(i => i.id === id))
      .filter((i): i is PopoverItem => Boolean(i));
  }, [order, items]);

  const { searchTerm, setSearchTerm, isSearching, filteredItems } =
    usePopoverSearch({ items: orderedItems });

  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;
  const allSelected = selectedCount === totalCount;

  return (
    <Popover placement='bottom-end' isLazy>
      <PopoverTrigger>
        <Button
          colorScheme='primary'
          variant='outline'
          size='sm'
          leftIcon={<Icon as={FaSliders} boxSize={3.5} />}
        >
          {copy.button} ({selectedCount}/{totalCount})
        </Button>
      </PopoverTrigger>

      <PopoverContent minW='280px' maxW='320px'>
        <PopoverArrow />
        <PopoverCloseButton />

        <PopoverHeader fontWeight='semibold'>
          <Text>{copy.header}</Text>
          <Text fontSize='sm' fontWeight='normal'>
            {copy.description}
          </Text>
          <PopoverSelectAll
            allSelected={allSelected}
            totalCount={totalCount}
            onToggle={toggleAll}
            selectAllLabel={copy.selectAll}
            clearAllLabel={copy.clearAll}
          />
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          <PopoverSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={copy.searchPlaceholder}
          />

          <PopoverSelectableList
            items={filteredItems}
            selectedIds={selectedIds}
            requiredIds={requiredIds as string[]}
            enableOrdering
            isSearching={isSearching}
            orderedIds={order}
            onCheck={toggle}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onDragEnd={handleDragEnd}
            emptyMessage={copy.noColumnsFound}
            maxHeight='20rem'
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
