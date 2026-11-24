import { Skeleton } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { SortState } from 'src/components/table';
import { SampleCollection } from 'src/utils/api/types';

import { SAMPLE_COLLECTION_TABLE_CONFIG } from '../../config';
import {
  getSampleCollectionItemsColumns,
  getSampleCollectionItemsRows,
} from '../../helpers';
import { useSampleCollectionItems } from '../../hooks/useSampleCollectionItems';
import { SampleTable } from '../SampleTable';

// Both tables start sorted by Sample ID, A to Z, as the legacy table started on
// its first column.
const FETCHED_INITIAL_SORT: SortState = {
  columnId: '_identifierSort',
  direction: 'asc',
};
const FALLBACK_INITIAL_SORT: SortState = {
  columnId: 'identifier',
  direction: 'asc',
};

interface SampleCollectionItemsTableProps {
  /** The identifier of the parent Dataset/SampleCollection used for the API query. */
  parentIdentifier: string;
  fallbackSampleCollection?: SampleCollection;
}

export const SampleCollectionItemsTable = ({
  parentIdentifier,
  fallbackSampleCollection,
}: SampleCollectionItemsTableProps) => {
  const { data: samples, isLoading } = useSampleCollectionItems(
    parentIdentifier,
    true,
  );

  // The fetched samples, one row each.
  const fetched = useMemo(
    () =>
      samples?.length
        ? {
            columns: getSampleCollectionItemsColumns(samples),
            rows: getSampleCollectionItemsRows(samples),
          }
        : null,
    [samples],
  );

  // Without fetched samples: the collection's own item list, each row with
  // the collection's aggregate properties.
  const fallback = useMemo(
    () =>
      fallbackSampleCollection?.itemListElement?.length
        ? {
            columns: SAMPLE_COLLECTION_TABLE_CONFIG.getColumns(
              fallbackSampleCollection,
            ),
            rows: SAMPLE_COLLECTION_TABLE_CONFIG.getRows(
              fallbackSampleCollection,
            ),
          }
        : null,
    [fallbackSampleCollection],
  );

  // While loading show a skeleton that matches the page style.
  if (isLoading) {
    return (
      <>
        <Skeleton height='32px' mb={2} borderRadius='md' />
        <Skeleton height='32px' mb={2} borderRadius='md' />
        <Skeleton height='32px' mb={2} borderRadius='md' />
        <Skeleton height='32px' borderRadius='md' />
      </>
    );
  }

  if (fetched) {
    const count = fetched.rows.length;
    return (
      <SampleTable
        label={`${count} sample${count !== 1 ? 's' : ''} in this collection`}
        columns={fetched.columns}
        rows={fetched.rows}
        initialSort={FETCHED_INITIAL_SORT}
        pagination
      />
    );
  }

  if (fallback) {
    return (
      <SampleTable
        label={SAMPLE_COLLECTION_TABLE_CONFIG.label}
        columns={fallback.columns}
        rows={fallback.rows}
        initialSort={FALLBACK_INITIAL_SORT}
        pagination
      />
    );
  }

  return null;
};
