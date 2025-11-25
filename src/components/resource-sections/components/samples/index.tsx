import {
  Box,
  Flex,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { Sample } from 'src/utils/api/types';
import { Table } from 'src/components/table';

interface SamplesDisplayProps {
  sample: Sample | null | undefined;
}

/**
 * Format unit text:
 * - Lowercase all characters.
 * - Replace underscores (e.g., "CELL_COUNT") with spaces.
 */
const formatUnitText = (unit: string | undefined) => {
  if (!unit) return '';
  return unit.toLowerCase().replace(/_/g, ' ');
};

/**
 * Format a numeric "value" field.
 * Supports:
 * - Exact number.
 * - Min / Max (range).
 * - Only min (>=)
 * - Only max (<=)
 */
const formatValue = ({
  value,
  minValue,
  maxValue,
}: {
  value?: number;
  minValue?: number;
  maxValue?: number;
}) => {
  if (value != null) {
    return value.toLocaleString();
  }

  if (minValue != null && maxValue != null) {
    // If min == max, show single number
    if (minValue === maxValue) {
      return minValue.toLocaleString();
    }
    return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
  }

  if (minValue != null) {
    return `>= ${minValue.toLocaleString()}`;
  }

  if (maxValue != null) {
    return `<= ${maxValue.toLocaleString()}`;
  }

  return '';
};

export const SamplesDisplay = ({ sample }: SamplesDisplayProps) => {
  // Sample Collection
  const sampleCollection = {
    label: 'Number of Samples',
    // unit: sample?.collectionSize?.unitText
    //   ? `${formatUnitText(sample.collectionSize.unitText)}${
    //       sample?.collectionSize?.value !== 1 ? 's' : ''
    //     }`
    //   : '',
    value: sample?.collectionSize?.value,
    valueText: formatValue({
      value: sample?.collectionSize?.value,
      minValue: sample?.collectionSize?.minValue,
      maxValue: sample?.collectionSize?.maxValue,
    }),
    sampleList: {
      caption: 'List of samples.',
      data: sample?.sampleList || [],
    },
  };

  // Sample Quantity
  const sampleQuantity = {
    label: 'Sample Quantity',
    list: {
      caption: 'List of sample quantities.',
      data:
        sample?.sampleQuantity?.map(item => ({
          ...item,
          // Include unit text if available
          valueText:
            formatValue({
              value: item.value,
              minValue: item.minValue,
              maxValue: item.maxValue,
            }) +
            ' ' +
            (item.unitText ? `${formatUnitText(item.unitText)}(s)` : ''),
        })) ?? [],
    },
  };

  return (
    <Flex flexDirection='column' gap={8}>
      {/* Sample Quantity */}
      {sampleQuantity.list.data.length > 0 && (
        <Box>
          <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
            {sampleQuantity.label}
          </Heading>
          <ScrollContainer
            maxHeight='300px'
            border='0.15px solid'
            pr={0}
            borderColor='gray.100'
          >
            <UnorderedList ml={0}>
              {sampleQuantity.list.data.map((item, idx) => {
                const name = formatUnitText(item.name);
                return (
                  <ListItem
                    key={item.name}
                    wordBreak='break-all'
                    lineHeight='short'
                    fontSize='sm'
                    bg={idx % 2 === 0 ? 'white' : 'page.alt'}
                    p={2}
                    borderBottom='0.15px solid'
                    borderColor='gray.100'
                  >
                    {name && (
                      <Text as='span' fontWeight='medium'>
                        {name.charAt(0).toUpperCase() + name.slice(1)}:{' '}
                      </Text>
                    )}
                    {item.valueText}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </ScrollContainer>
        </Box>
      )}

      {/* Sample Collection Size */}
      {sampleCollection.value && (
        <Box>
          <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
            {sampleCollection.label}:{' '}
            <Text as='span' fontWeight='normal'>
              {sampleCollection.value.toLocaleString()}
              {/* {sampleCollection?.unit} */}
            </Text>
          </Heading>

          {/* Sample list table */}
          {sampleCollection?.sampleList?.data?.length > 0 && (
            <Table
              ariaLabel={sampleCollection.sampleList.caption}
              caption={sampleCollection.sampleList.caption}
              data={sampleCollection.sampleList.data}
              tableContainerProps={{
                overflowY: 'auto',
                maxHeight: '400px',
              }}
              getTableRowProps={(_, idx) => ({
                bg: idx % 2 === 0 ? 'white' : 'page.alt',
              })}
              // Show Identifier as link
              getCells={props => (
                <Flex
                  {...props}
                  wordBreak='break-all'
                  lineHeight='short'
                  fontSize='sm'
                  py={1}
                >
                  <Link href={props.data.url}>
                    {props.data?.[props.column.property]?.replace(/-/g, '-')}
                  </Link>
                </Flex>
              )}
              hasPagination
              columns={[
                {
                  title: 'Sample ID',
                  property: 'identifier',
                  isSortable: true,
                },
              ]}
            />
          )}
        </Box>
      )}
    </Flex>
  );
};
