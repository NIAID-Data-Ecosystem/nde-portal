import React, { useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FaSliders } from 'react-icons/fa6';
import {
  useSelectableList,
  usePopoverSearch,
  PopoverSearchInput,
  PopoverSelectAll,
  PopoverEmptyState,
} from 'src/components/popover';
import type { PopoverItem, PopoverItemGroup } from 'src/components/popover';
import { FilterConfig } from '../../types';

const CUSTOM_VISIBLE_FILTERS_STORAGE_KEY = 'search-visible-filters';

const COPY = {
  button: 'Customize Search Filters',
  header: 'Customize Filters',
  description: 'Select which filters to display.',
  searchPlaceholder: 'Search filters',
  noFiltersFound: 'No filters found',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

interface CustomizeFiltersPopoverProps {
  filtersList: FilterConfig[];
  onVisibleFiltersChange?: (visibleFilterIds: string[]) => void;
}

/**
 * Convert FilterConfig[] => PopoverItem[], using `category` as the groupKey so
 * the shared search hook can produce grouped results automatically.
 */
const toPopoverItems = (filters: FilterConfig[]): PopoverItem[] =>
  filters.map(f => ({
    id: f.id,
    title: f.name,
    groupKey: f.category,
  }));

export const CustomizeFiltersPopover = ({
  filtersList,
  onVisibleFiltersChange,
}: CustomizeFiltersPopoverProps) => {
  const items = useMemo(() => toPopoverItems(filtersList), [filtersList]);
  const allIds = useMemo(() => items.map(i => i.id), [items]);

  // No ordering for filters (selection + persistence).
  const { selectedIds, isReady, toggle, toggleAll } = useSelectableList({
    items,
    enableOrdering: false,
    storageKeyVisible: CUSTOM_VISIBLE_FILTERS_STORAGE_KEY,
    // Default: all filters visible.
    defaultVisibleIds: allIds,
  });

  // Notify parent whenever visibility changes.
  useEffect(() => {
    if (!isReady) return;
    onVisibleFiltersChange?.(selectedIds);
  }, [selectedIds, isReady, onVisibleFiltersChange]);

  const { searchTerm, setSearchTerm, filteredGroups } = usePopoverSearch({
    items,
  });

  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;
  const allSelected = selectedCount === totalCount;

  return (
    <Popover placement='bottom-end' isLazy>
      <Flex justifyContent='flex-end'>
        <PopoverTrigger>
          <Button colorScheme='gray' variant='outline' size='sm' flex={1}>
            <Icon as={FaSliders} boxSize={4} mr={2} />
            {COPY.button}
          </Button>
        </PopoverTrigger>
      </Flex>
      <PopoverContent>
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

          <CheckboxGroup size='md' value={selectedIds}>
            <Flex flexDirection='column' maxHeight='16rem' overflowY='auto'>
              {filteredGroups.length === 0 ? (
                <PopoverEmptyState message={COPY.noFiltersFound} />
              ) : (
                filteredGroups.map((group: PopoverItemGroup) => (
                  <Stack
                    key={group.groupKey}
                    gap={0.5}
                    borderBottom='1px solid'
                    borderColor='gray.100'
                    px={2}
                    py={1}
                  >
                    <Text
                      fontSize='xs'
                      fontWeight='semibold'
                      color='gray.800'
                      px={1}
                    >
                      {group.groupKey}
                    </Text>
                    {group.items.map(item => (
                      <Checkbox
                        key={item.id}
                        value={item.id}
                        px={2}
                        _hover={{ bg: 'secondary.50' }}
                        borderRadius='sm'
                        onChange={e => toggle(item.id, e.target.checked)}
                      >
                        <Text ml={1} fontSize='xs'>
                          {item.title}
                        </Text>
                      </Checkbox>
                    ))}
                  </Stack>
                ))
              )}
            </Flex>
          </CheckboxGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
