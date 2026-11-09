import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import {
  ColumnCustomizer,
  DataTable,
  SortState,
  useColumnPreferences,
  useDataTable,
} from 'src/components/table/data-table';

import { REPOSITORY_MATCHER_COLUMNS } from '../table-config';
import { RepositoryMatcherRow } from '../types';

/** Pre-v1 keys written by the old customize-columns popover. */
const LEGACY_KEYS = {
  visible: 'repository-matcher-visible-columns',
  order: 'repository-matcher-column-order',
};
const INITIAL_SORT: SortState = { columnId: 'name', direction: 'asc' };
const getRowId = (row: RepositoryMatcherRow) => row._id;

interface RepositoryMatcherTableProps {
  /** Rows after search and filters. */
  rows: RepositoryMatcherRow[];
  loading: boolean;
  error?: unknown;
}

/**
 * The repository matcher's results: count, column customization and table.
 *
 * Kept in its own memoized component so sorting, pinning and column changes
 * re-render only this, not the page around it (filter sidebar, dictionary),
 * and typing in the search box doesn't re-render the table until the
 * debounced results change. Search and filtering stay with the page, which
 * owns that state.
 */
export const RepositoryMatcherTable = React.memo(
  function RepositoryMatcherTable({
    rows,
    loading,
    error,
  }: RepositoryMatcherTableProps) {
    const preferences = useColumnPreferences({
      tableId: 'repository-matcher',
      columns: REPOSITORY_MATCHER_COLUMNS,
      legacyKeys: LEGACY_KEYS,
    });
    const table = useDataTable({
      data: rows,
      columns: REPOSITORY_MATCHER_COLUMNS,
      getRowId,
      preferences,
      sort: { initial: INITIAL_SORT },
    });

    return (
      <>
        <Flex
          w='100%'
          py={2}
          justifyContent='space-between'
          alignItems='flex-end'
        >
          <Text fontSize='sm' fontWeight='semibold' lineHeight='normal'>
            {table.rowCount} results
          </Text>
          <ColumnCustomizer
            columns={REPOSITORY_MATCHER_COLUMNS}
            preferences={preferences}
            allowReorder
            allowPinning
          />
        </Flex>

        <DataTable
          table={table}
          label='Repositories and resource catalogs available for data deposit'
          interactive
          skeletonRows={10}
          status={{
            loading,
            error: error ? true : undefined,
            empty: (
              <Flex direction='column' align='center'>
                <Text fontWeight='bold'>No repositories match</Text>
                <Text color='gray.500'>
                  Try clearing some filters or broadening your search.
                </Text>
              </Flex>
            ),
          }}
        />
      </>
    );
  },
);
