import { Skeleton } from '@chakra-ui/react';
import { SampleTable } from '../SampleTable';
import { Cell } from '../SampleTable/Cells';
import { useSampleCollectionItems } from '../../hooks/useSampleCollectionItems';
import { SAMPLE_COLLECTION_TABLE_CONFIG } from '../../config';
import {
  getSampleCollectionItemsColumns,
  getSampleCollectionItemsRows,
} from '../../helpers';
import { SampleCollection } from 'src/utils/api/types';

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

  if (!samples || samples.length === 0) {
    if (fallbackSampleCollection?.itemListElement?.length) {
      return (
        <SampleTable
          label={SAMPLE_COLLECTION_TABLE_CONFIG.label}
          caption={SAMPLE_COLLECTION_TABLE_CONFIG.caption}
          tableProps={{
            columns: SAMPLE_COLLECTION_TABLE_CONFIG.getColumns(
              fallbackSampleCollection,
            ),
            data: SAMPLE_COLLECTION_TABLE_CONFIG.getRows(
              fallbackSampleCollection,
            ),
            getCells: props => {
              const data = props.data?.[props.column.property];
              return Cell.renderCellData?.({ ...props, data });
            },
            ...SAMPLE_COLLECTION_TABLE_CONFIG.tableProps,
          }}
        />
      );
    }

    return null;
  }

  const columns = getSampleCollectionItemsColumns(samples);
  const rows = getSampleCollectionItemsRows(samples);

  return (
    <SampleTable
      label='Sample Collection Items Table'
      caption={`${samples.length} sample${
        samples.length !== 1 ? 's' : ''
      } in this collection`}
      tableProps={{
        columns,
        data: rows,
        getCells: props => {
          // The Sample ID column sorts by '_identifierSort' (a plain string)
          // but must render using 'identifier' (the { identifier, url }
          // object) so that the link cell displays correctly.
          const property =
            props.column.property === '_identifierSort'
              ? 'identifier'
              : props.column.property;
          const data = props.data?.[property];
          return Cell.renderCellData?.({ ...props, data });
        },
        hasPagination: true,
      }}
    />
  );
};
