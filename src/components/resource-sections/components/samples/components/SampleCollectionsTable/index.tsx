import { Skeleton } from '@chakra-ui/react';
import { SampleTable } from '../SampleTable';
import { Cell } from '../SampleTable/Cells';
import { useSampleCollectionItems } from '../../hooks/useSampleCollectionItems';
import {
  getSampleCollectionItemsColumns,
  getSampleCollectionItemsRows,
} from '../../helpers';

interface SampleCollectionItemsTableProps {
  /** The identifier of the parent Dataset/SampleCollection used for the API query. */
  parentIdentifier: string;
}

export const SampleCollectionItemsTable = ({
  parentIdentifier,
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
