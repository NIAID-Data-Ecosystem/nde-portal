import { FormattedResource } from 'src/utils/api/types';
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

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
      <Table size='sm'>
        <Thead>
          <Tr>
            <Th {...thStyles} textTransform='none' isNumeric>
              Quantity
            </Th>
            <Th {...thStyles} textTransform='none'>
              Type
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {collectionSizeRows.map((collection, idx) => {
            return (
              <Tr key={idx}>
                <Td isNumeric {...tdStyles}>
                  {collection?.valueText}
                </Td>
                <Td {...tdStyles}>{collection?.unitText}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};
