import { FormattedResource } from 'src/utils/api/types';
import { Box, Table } from '@chakra-ui/react';

interface ResourceCatalogCollectionProps {
  collectionSize?: FormattedResource['collectionSize'];
}

const thStyles = {
  borderBottom: '1px!important',
  borderBottomColor: 'gray.200!important',
  color: 'text.heading!important',
  fontWeight: 'medium!important',
  textTransform: 'none!important',
  p: '2!important',
};

const tdStyles = {
  p: '2!important',
  borderBottom: '1px!important',
  borderBottomColor: 'gray.100!important',
  fontSize: 'xs!important',
};
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
    <Box>
      <Table.Root size='sm'>
        <Table.Header>
          <Table.Row
            bg='white'
            borderBottom='1px solid'
            borderBottomColor='gray.200'
          >
            <Table.ColumnHeader
              textAlign='end'
              {...thStyles}
              textTransform='none'
            >
              Quantity
            </Table.ColumnHeader>
            <Table.ColumnHeader {...thStyles} textTransform='none'>
              Type
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {collectionSizeRows.map((collection, idx) => {
            return (
              <Table.Row
                key={idx}
                borderBottom='1px solid'
                borderBottomColor='gray.100'
                bg='white'
              >
                <Table.Cell textAlign='end' {...tdStyles}>
                  {collection?.valueText}
                </Table.Cell>
                <Table.Cell {...tdStyles}>{collection?.unitText}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
