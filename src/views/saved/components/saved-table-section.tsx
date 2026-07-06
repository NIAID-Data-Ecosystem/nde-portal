import { useCallback, useMemo, useState } from 'react';
import { Flex, Stack, Text, VStack } from '@chakra-ui/react';
import { Table } from 'src/components/table';
import { SearchInput } from 'src/components/search-input';
import { useSearchedData } from 'src/views/repository-matcher/hooks/useSearchedData';
import { formatTableData } from '../table-config';
import { SavedColumn } from '../types';

const TABLE_CONTAINER_PROPS = {
  overflowX: 'auto' as const,
  maxHeight: '350px',
  w: '100%',
  bg: 'white',
  overflowY: 'auto' as const,
};

interface SavedTableSectionProps<TItem> {
  /** Section heading, e.g. "Saved Resources". */
  title: string;
  /** Short blurb rendered under the heading. */
  description: string;
  /** Rich column definitions driving cells, sort, and search. */
  columns: SavedColumn<TItem, any>[];
  /** Raw saved items to render. */
  data: TItem[];
  /** Stable id for each item, used to dedupe rows. */
  getRowId: (item: TItem, index: number) => string;
  /** Noun shown next to the item count, e.g. { singular: 'item', plural: 'items' }. */
  unit: { singular: string; plural: string };
  searchPlaceholder: string;
  searchAriaLabel: string;
  tableAriaLabel: string;
  caption: string;
  emptyState?: React.ReactNode;
  tableContainerProps?: Omit<
    React.ComponentProps<typeof Table>['tableContainerProps'],
    'children'
  >;
}

/**
 * A self-contained saved-items table: header with item count, a search input,
 * and a sortable/searchable virtualized table. All search/sort/render wiring is
 * derived from the supplied `columns` config, so the same component drives both
 * saved resources and saved queries.
 */
export function SavedTableSection<TItem>({
  title,
  description,
  columns,
  data,
  getRowId,
  unit,
  searchPlaceholder,
  searchAriaLabel,
  tableAriaLabel,
  tableContainerProps = TABLE_CONTAINER_PROPS,
  caption,
  emptyState,
}: SavedTableSectionProps<TItem>) {
  const tableColumns = useMemo(
    () =>
      columns.map(col => ({
        title: col.label,
        property: col.id,
        isSortable: col.columns?.isSortable,
        props: col.columns?.style,
      })),
    [columns],
  );

  /****** Search *****/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );
  // Search iterates ALL columns (incl. hidden), so toggling visibility
  // doesn't drop matches that live in hidden columns.
  const rows = useMemo(
    () => formatTableData(data, columns, getRowId),
    [data, columns, getRowId],
  );
  const searchedData = useSearchedData(rows, searchTerm);

  /****** Sort *****/
  const [sortProperty, setSortProperty] = useState<string>(columns[0].id);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = useCallback((property: string, ascending: boolean) => {
    setSortProperty(property);
    setSortAsc(ascending);
  }, []);

  const sortedData = useMemo(() => {
    if (!searchedData?.length) return searchedData;
    const col = columns.find(c => c.id === sortProperty);
    if (!col) return searchedData;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...searchedData].sort((a, b) => {
      let va: any = accessor((a as any)[col.id]);
      let vb: any = accessor((b as any)[col.id]);
      va = va ?? (typeof va === 'number' ? 0 : '');
      vb = vb ?? (typeof vb === 'number' ? 0 : '');
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), undefined, {
              sensitivity: 'base',
              numeric: true,
            });
      return sortAsc ? cmp : -cmp;
    });
  }, [searchedData, sortProperty, sortAsc, columns]);

  // Stable references so the table's row-level memoization isn't defeated by
  // new function/object identities on every page render.
  const getTableRowProps = useCallback(
    (_: any, idx: number) => ({
      bg: idx % 2 === 0 ? 'white' : '#fafbfd',
      _hover: { bg: 'secondary.50' },
    }),
    [],
  );

  const getCells = useCallback(
    ({
      column,
      data: row,
      isLoading: rowLoading,
    }: {
      column: { property: string };
      data: any;
      isLoading?: boolean;
    }) => {
      const col = columns.find(c => c.id === column.property);
      if (!col) return null;
      return col.component({
        value: row?.[col.id],
        isLoading: rowLoading,
        data: row,
      });
    },
    [columns],
  );

  return (
    <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
      <Stack
        direction='row'
        spacing={6}
        justifyContent='space-between'
        flexWrap='wrap'
      >
        <VStack align='start' gap={0.5} fontSize='sm' fontWeight='normal'>
          <Text fontWeight='semibold'>
            {title}
            <Text as='span' color='gray.700' fontWeight='medium' ml={2}>
              {data.length} {data.length === 1 ? unit.singular : unit.plural}
            </Text>
          </Text>
          <Text lineHeight='short' width='400px'>
            {description}
          </Text>
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
            width='100%'
            colorScheme='primary'
          />
        </Flex>
      </Stack>
      <Table
        ariaLabel={tableAriaLabel}
        caption={caption}
        columns={tableColumns}
        data={sortedData as any}
        isLoading={false}
        hasPagination={true}
        stickyHeader
        virtualized
        tableContainerProps={tableContainerProps}
        getTableRowProps={getTableRowProps}
        controlledSortProperty={sortProperty}
        controlledSortAsc={sortAsc}
        onControlledSort={handleSort}
        getCells={getCells}
        emptyState={
          emptyState ?? (
            <Flex direction='column' align='center' py={10}>
              <Text fontWeight='bold'>No matches</Text>
              <Text color='gray.700'>Try broadening your search.</Text>
            </Flex>
          )
        }
      />
    </Flex>
  );
}
