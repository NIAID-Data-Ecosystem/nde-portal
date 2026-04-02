import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaSliders,
  FaGripVertical,
  FaAngleUp,
  FaAngleDown,
} from 'react-icons/fa6';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

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

export interface ColumnConfig {
  id: string;
  title: string;
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

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

export const REQUIRED_COLUMN_IDS = ['identifier', 'name'];

interface SortableColumnItemProps {
  col: ColumnConfig;
  isChecked: boolean;
  isRequired: boolean;
  isFirst: boolean;
  isLast: boolean;
  isSearching: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const SortableColumnItem = ({
  col,
  isChecked,
  isRequired,
  isFirst,
  isLast,
  isSearching,
  onCheck,
  onMoveUp,
  onMoveDown,
}: SortableColumnItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id, disabled: isRequired || isSearching });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      align='center'
      px={2}
      py={0.5}
      borderRadius='sm'
      gap={1}
      _hover={{ bg: isRequired ? undefined : 'secondary.50' }}
      bg={isDragging ? 'secondary.50' : undefined}
      role='group'
    >
      {/* Drag handle */}
      <Tooltip
        label={
          isRequired
            ? 'Required column — cannot be reordered'
            : isSearching
            ? 'Clear search to reorder'
            : 'Drag to reorder'
        }
        placement='left'
        hasArrow
        openDelay={400}
      >
        <Flex
          {...(isRequired || isSearching
            ? {}
            : { ...attributes, ...listeners })}
          cursor={isRequired || isSearching ? 'not-allowed' : 'grab'}
          color={isRequired || isSearching ? 'gray.300' : 'gray.400'}
          _hover={{
            color: isRequired || isSearching ? 'gray.300' : 'gray.600',
          }}
          align='center'
          px={0.5}
          flexShrink={0}
        >
          <Icon as={FaGripVertical} boxSize={3} />
        </Flex>
      </Tooltip>

      {/* Checkbox */}
      <Checkbox
        value={col.id}
        isChecked={isChecked}
        isDisabled={isRequired}
        onChange={e => onCheck(col.id, e.target.checked)}
        flex={1}
        minW={0}
      >
        <Text ml={1} fontSize='xs' noOfLines={1} title={col.title}>
          {col.title}
        </Text>
      </Checkbox>

      {/* Up / Down buttons */}
      {!isSearching && (
        <Flex
          gap={0.5}
          flexShrink={0}
          opacity={0}
          _groupHover={{ opacity: isRequired ? 0 : 1 }}
          transition='opacity 0.15s'
        >
          <IconButton
            aria-label={`Move ${col.title} up`}
            icon={<Icon as={FaAngleUp} />}
            size='xs'
            variant='ghost'
            colorScheme='gray'
            isDisabled={isRequired || isFirst}
            onClick={() => onMoveUp(col.id)}
          />
          <IconButton
            aria-label={`Move ${col.title} down`}
            icon={<Icon as={FaAngleDown} />}
            size='xs'
            variant='ghost'
            colorScheme='gray'
            isDisabled={isRequired || isLast}
            onClick={() => onMoveDown(col.id)}
          />
        </Flex>
      )}
    </Flex>
  );
};

export const CustomizeColumnsPopover = ({
  columnsList,
  onVisibleColumnsChange,
  onColumnOrderChange,
}: CustomizeColumnsPopoverProps) => {
  const allColumnIds = useMemo(() => columnsList.map(c => c.id), [columnsList]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  // Required columns are always first; rest follow the persisted/default order.
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const [isReady, setIsReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isSearching = searchTerm.trim().length > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedVis = window.localStorage.getItem(
      CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    let resolvedVisible: string[];
    if (storedVis) {
      try {
        const parsed = JSON.parse(storedVis);
        const valid = Array.isArray(parsed)
          ? parsed.filter((id: unknown): id is string =>
              allColumnIds.includes(id as string),
            )
          : [];
        resolvedVisible =
          valid.length > 0
            ? valid
            : DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
                allColumnIds.includes(id),
              );
      } catch {
        resolvedVisible = DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
          allColumnIds.includes(id),
        );
      }
    } else {
      resolvedVisible = DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
        allColumnIds.includes(id),
      );
    }

    const storedOrder = window.localStorage.getItem(
      CUSTOM_COLUMN_ORDER_STORAGE_KEY,
    );
    let resolvedOrder: string[];
    if (storedOrder) {
      try {
        const parsed = JSON.parse(storedOrder);
        // Keep only ids that exist in the current column list; append any new ones at the end
        const valid = Array.isArray(parsed)
          ? parsed.filter((id: unknown): id is string =>
              allColumnIds.includes(id as string),
            )
          : [];
        const missing = allColumnIds.filter(id => !valid.includes(id));
        resolvedOrder = [...valid, ...missing];
      } catch {
        resolvedOrder = allColumnIds;
      }
    } else {
      resolvedOrder = allColumnIds;
    }

    // Ensure required columns are always at the top of the order
    resolvedOrder = [
      ...REQUIRED_COLUMN_IDS.filter(id => allColumnIds.includes(id)),
      ...resolvedOrder.filter(id => !REQUIRED_COLUMN_IDS.includes(id)),
    ];

    setVisibleColumnIds(resolvedVisible);
    setColumnOrder(resolvedOrder);
    setIsReady(true);
  }, [allColumnIds]);

  // Notify parent of visibility changes
  useEffect(() => {
    if (!isReady) return;
    onVisibleColumnsChange?.(visibleColumnIds);
  }, [visibleColumnIds, onVisibleColumnsChange, isReady]);

  // Notify parent of order changes
  useEffect(() => {
    if (!isReady) return;
    onColumnOrderChange?.(columnOrder);
  }, [columnOrder, onColumnOrderChange, isReady]);

  const persistVisible = (ids: string[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
        JSON.stringify(ids),
      );
    }
  };

  const persistOrder = (ids: string[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        CUSTOM_COLUMN_ORDER_STORAGE_KEY,
        JSON.stringify(ids),
      );
    }
  };

  const handleCheckChange = (id: string, checked: boolean) => {
    setVisibleColumnIds(prev => {
      const next = checked ? [...prev, id] : prev.filter(v => v !== id);
      // Always keep required columns
      const withRequired = [
        ...REQUIRED_COLUMN_IDS.filter(rid => allColumnIds.includes(rid)),
        ...next.filter(nid => !REQUIRED_COLUMN_IDS.includes(nid)),
      ];
      persistVisible(withRequired);
      return withRequired;
    });
  };

  const handleSelectAll = () => {
    const allSelected = visibleColumnIds.length === allColumnIds.length;
    const next = allSelected
      ? REQUIRED_COLUMN_IDS.filter(id => allColumnIds.includes(id))
      : allColumnIds;
    setVisibleColumnIds(next);
    persistVisible(next);
  };

  const applyNewOrder = (next: string[]) => {
    // Always keep required columns pinned to top
    const pinned = REQUIRED_COLUMN_IDS.filter(id => allColumnIds.includes(id));
    const rest = next.filter(id => !REQUIRED_COLUMN_IDS.includes(id));
    const final = [...pinned, ...rest];
    setColumnOrder(final);
    persistOrder(final);
  };

  const handleMoveUp = (id: string) => {
    setColumnOrder(prev => {
      const movableSection = prev.filter(i => !REQUIRED_COLUMN_IDS.includes(i));
      const idx = movableSection.indexOf(id);
      if (idx <= 0) return prev;
      const next = arrayMove(movableSection, idx, idx - 1);
      applyNewOrder([
        ...REQUIRED_COLUMN_IDS.filter(i => allColumnIds.includes(i)),
        ...next,
      ]);
      return [
        ...REQUIRED_COLUMN_IDS.filter(i => allColumnIds.includes(i)),
        ...next,
      ];
    });
  };

  const handleMoveDown = (id: string) => {
    setColumnOrder(prev => {
      const movableSection = prev.filter(i => !REQUIRED_COLUMN_IDS.includes(i));
      const idx = movableSection.indexOf(id);
      if (idx === -1 || idx >= movableSection.length - 1) return prev;
      const next = arrayMove(movableSection, idx, idx + 1);
      const final = [
        ...REQUIRED_COLUMN_IDS.filter(i => allColumnIds.includes(i)),
        ...next,
      ];
      persistOrder(final);
      return final;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumnOrder(prev => {
      const oldIdx = prev.indexOf(active.id as string);
      const newIdx = prev.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return prev;
      const next = arrayMove(prev, oldIdx, newIdx);
      // Re-pin required columns to top after move
      applyNewOrder(next);
      return [
        ...REQUIRED_COLUMN_IDS.filter(i => allColumnIds.includes(i)),
        ...next.filter(i => !REQUIRED_COLUMN_IDS.includes(i)),
      ];
    });
  };

  // Columns to display in the popover list
  // Use columnOrder as the display order; filter by search term if active.
  const displayColumns = useMemo(() => {
    const ordered = columnOrder
      .map(id => columnsList.find(c => c.id === id))
      .filter((c): c is ColumnConfig => !!c);

    if (!isSearching) return ordered;

    const term = searchTerm.trim().toLowerCase();
    return ordered.filter(c => c.title.toLowerCase().includes(term));
  }, [columnOrder, columnsList, isSearching, searchTerm]);

  const movableIds = useMemo(
    () => columnOrder.filter(id => !REQUIRED_COLUMN_IDS.includes(id)),
    [columnOrder],
  );

  const selectedCount = visibleColumnIds.length;
  const totalCount = allColumnIds.length;
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

        <PopoverHeader fontWeight='semibold' pr={8}>
          <Text>{COPY.header}</Text>
          <Text fontSize='sm' fontWeight='normal' color='gray.600'>
            {COPY.description}
          </Text>
          <Flex justifyContent='flex-end' mt={1}>
            <Button
              size='xs'
              variant='link'
              colorScheme='black'
              onClick={handleSelectAll}
            >
              {allSelected
                ? COPY.clearAll
                : `${COPY.selectAll} (${totalCount})`}
            </Button>
          </Flex>
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          {/* Search */}
          <Flex px={2} py={1}>
            <Input
              size='sm'
              placeholder={COPY.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Flex>

          {/* Column list */}
          <Stack gap={0} px={0} py={1} maxHeight='20rem' overflowY='auto'>
            {displayColumns.length === 0 ? (
              <Text fontSize='sm' color='gray.600' px={3} py={2}>
                No columns found
              </Text>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={isSearching ? [] : columnOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {displayColumns.map((col, idx) => {
                    const isRequired = REQUIRED_COLUMN_IDS.includes(col.id);
                    // For up/down, work in the movable section only
                    const movableIdx = movableIds.indexOf(col.id);
                    const isFirstMovable = movableIdx === 0;
                    const isLastMovable = movableIdx === movableIds.length - 1;

                    return (
                      <SortableColumnItem
                        key={col.id}
                        col={col}
                        isChecked={visibleColumnIds.includes(col.id)}
                        isRequired={isRequired}
                        isFirst={isRequired || isFirstMovable}
                        isLast={!isRequired && isLastMovable}
                        isSearching={isSearching}
                        onCheck={handleCheckChange}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
