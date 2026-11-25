import { BoxProps, Flex, Stack, Text, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { SearchInput } from 'src/components/search-input';
import { DataTable, SortState, useTableSearch } from 'src/components/table';

import { formatTableData } from '../table-config';
import { SavedColumnDef } from '../types';
import { SavedEmptyState } from './saved-empty-state';

interface SavedTableSectionProps<TItem> {
  /** Section heading, e.g. "Saved Resources". */
  title: string;
  /** Short blurb rendered under the heading. */
  description: string;
  /**
   * The table's columns; search matches every one of them. Keep the array
   * stable (a module constant): cells memoize on it.
   */
  columns: SavedColumnDef<TItem>[];
  /** The order the rows start in. */
  initialSort: SortState;
  /** Raw saved items to render. */
  data: TItem[];
  /**
   * Stable id for each item, used to dedupe rows. Keep it stable too (a
   * module-level function): the rows are rebuilt whenever it changes.
   */
  getRowId: (item: TItem, index: number) => string;
  /** Noun shown next to the item count, e.g. { singular: 'item', plural: 'items' }. */
  unit: { singular: string; plural: string };
  searchPlaceholder: string;
  searchAriaLabel: string;
  /** The table's accessible name (its visually hidden caption). */
  label: string;
  /** The table's maximum height, pager included (see DataTable). */
  maxHeight?: BoxProps['maxHeight'];
  /** Shown when a search/filter returns no matching rows. */
  emptyState?: React.ReactNode;
  /** Shown when the user has not saved any items yet (no data at all). */
  noItemsState?: React.ReactNode;
}

const getTableRowId = (row: { _id: string }) => row._id;

/**
 * A self-contained saved-items table: header with item count, a search input,
 * and a sortable, searchable, paginated table. All search/sort/render wiring
 * comes from the supplied `columns`, so the same component drives both saved
 * resources and saved queries.
 */
export function SavedTableSection<TItem>({
  title,
  description,
  columns,
  initialSort,
  data,
  getRowId,
  unit,
  searchPlaceholder,
  searchAriaLabel,
  label,
  emptyState,
  noItemsState,
}: SavedTableSectionProps<TItem>) {
  /****** Search *****/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );
  const rows = useMemo(
    () => formatTableData(data, columns, getRowId),
    [data, columns, getRowId],
  );
  const searchedRows = useTableSearch(rows, searchTerm);

  return (
    <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
      <Stack
        direction='row'
        gap={6}
        justifyContent='space-between'
        flexWrap='wrap'
      >
        <VStack align='start' gap={0.5} fontSize='sm' fontWeight='normal'>
          <Text fontWeight='semibold'>
            {title}
            <Text as='span' color='gray.500' fontWeight='medium' ml={2}>
              {data.length} {data.length === 1 ? unit.singular : unit.plural}
            </Text>
          </Text>
          <Text lineHeight='moderate'>{description}</Text>
        </VStack>
        <Flex
          maxWidth={{ base: 'unset', xl: '350px' }}
          minWidth='300px'
          flex={1}
          width='100%'
        >
          <SearchInput
            size='sm'
            placeholder={searchPlaceholder}
            ariaLabel={searchAriaLabel}
            value={searchTerm}
            handleChange={handleSearchChange}
            isResponsive={false}
            alignItems='flex-end'
            onClose={() => setSearchTerm('')}
            colorPalette='primary'
            flexProps={{ flex: 1 }}
          />
        </Flex>
      </Stack>
      <Flex height='400px' width='100%'>
        <DataTable
          label={label}
          data={searchedRows}
          columns={columns}
          getRowId={getTableRowId}
          sort={{ initial: initialSort }}
          pagination
          status={{
            empty:
              // When there's no saved data at all, prompt the user to save
              // something; otherwise the table is empty because a search
              // returned no matches.
              data.length === 0
                ? noItemsState ?? (
                    <SavedEmptyState title='Nothing saved yet'>
                      Once you save items, they&apos;ll appear here.
                    </SavedEmptyState>
                  )
                : emptyState ?? (
                    <SavedEmptyState title='No matches'>
                      Try broadening your search.
                    </SavedEmptyState>
                  ),
          }}
        />
      </Flex>
    </Flex>
  );
}
