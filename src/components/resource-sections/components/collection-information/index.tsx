import { Table } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';

interface ResourceCatalogCollectionProps {
  collectionSize?: FormattedResource['collectionSize'];
}

export const ResourceCatalogCollection = ({
  collectionSize,
}: ResourceCatalogCollectionProps) => {
  if (!collectionSize) return <></>;

  const collectionSizeRows = collectionSize
    .map(collection => {
      let valueText = 'Unknown';
      let value = 0;
      if (collection?.minValue) {
        value = collection.minValue;
        valueText = '> ' + collection.minValue.toLocaleString();
      } else if (collection?.maxValue) {
        value = collection.maxValue;

        valueText = '< ' + collection.maxValue.toLocaleString();
      } else if (collection?.value) {
        value = collection.value;
        valueText = collection.value.toLocaleString();
      }

      return { value, valueText, unitText: collection?.unitText };
    })
    .filter(collection => collection.unitText)
    .sort((a, b) => b.value - a.value);

  return (
    <Table.ScrollArea rounded='md' borderWidth='1px' maxHeight='200px'>
      <Table.Root
        size='sm'
        colorPalette='primary'
        variant='outline'
        stickyHeader
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader textAlign='end'>Quantity</Table.ColumnHeader>
            <Table.ColumnHeader textTransform='none'>Type</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {collectionSizeRows.map((collection, idx) => {
            return (
              <Table.Row key={idx}>
                <Table.Cell textAlign='end'>{collection?.valueText}</Table.Cell>
                <Table.Cell>{collection?.unitText}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};
