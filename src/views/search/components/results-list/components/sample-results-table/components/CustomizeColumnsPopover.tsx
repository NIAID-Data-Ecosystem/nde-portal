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
} from 'src/components/popover';
import type { PopoverItem } from 'src/components/popover';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'search-visible-sample-columns';

export const CUSTOM_COLUMN_ORDER_STORAGE_KEY = 'search-sample-column-order';

export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'identifier',
  'name',
  'date',
  'includedInDataCatalog',
  'description',
  'conditionsOfAccess',
  'sex',
  'species',
];

export const REQUIRED_COLUMN_IDS = ['identifier', 'name'];

export interface ColumnConfig {
  id: string;
  title: string;
}

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

const COPY = {
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
  onVisibleColumnsChange,
  onColumnOrderChange,
}: CustomizeColumnsPopoverProps) => {
  // Map ColumnConfig => PopoverItem (no groupKey as columns are flat).
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
    requiredIds: REQUIRED_COLUMN_IDS,
    enableOrdering: true,
    storageKeyVisible: CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    storageKeyOrder: CUSTOM_COLUMN_ORDER_STORAGE_KEY,
    defaultVisibleIds: DEFAULT_VISIBLE_COLUMN_IDS,
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

  // Search state (items are displayed in `order` sequence).
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
          {COPY.button} ({selectedCount}/{totalCount})
        </Button>
      </PopoverTrigger>

      <PopoverContent minW='280px' maxW='320px'>
        <PopoverArrow />
        <PopoverCloseButton />

        <PopoverHeader fontWeight='semibold'>
          <Text>{COPY.header}</Text>
          <Text fontSize='sm' fontWeight='normal'>
            {COPY.description}
          </Text>
          <PopoverSelectAll
            allSelected={allSelected}
            totalCount={totalCount}
            onToggle={toggleAll}
            selectAllLabel={COPY.selectAll}
            clearAllLabel={COPY.clearAll}
          />
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          <PopoverSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={COPY.searchPlaceholder}
          />

          <PopoverSelectableList
            items={filteredItems}
            selectedIds={selectedIds}
            requiredIds={REQUIRED_COLUMN_IDS}
            enableOrdering
            isSearching={isSearching}
            orderedIds={order}
            onCheck={toggle}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onDragEnd={handleDragEnd}
            emptyMessage={COPY.noColumnsFound}
            maxHeight='20rem'
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
