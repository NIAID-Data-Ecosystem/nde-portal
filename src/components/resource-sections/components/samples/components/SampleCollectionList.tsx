import { Flex, Heading, Text } from '@chakra-ui/react';
import { Sample } from 'src/utils/api/types';
import { formatValue } from '../helpers';
import { Table } from 'src/components/table';
import { Link } from 'src/components/link';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';

interface SampleCollectionListProps {
  data: Sample;
}

export const SampleCollectionList = ({ data }: SampleCollectionListProps) => {
  // Sample Collection
  const sampleCollection = {
    label: formatSampleLabelFromProperty('collectionSize'),
    // unit: sample?.collectionSize?.unitText
    //   ? `${formatUnitText(sample.collectionSize.unitText)}${
    //       sample?.collectionSize?.value !== 1 ? 's' : ''
    //     }`
    //   : '',
    value: data?.collectionSize?.value,
    valueText: formatValue({
      value: data?.collectionSize?.value,
      minValue: data?.collectionSize?.minValue,
      maxValue: data?.collectionSize?.maxValue,
    }),
    sampleList: {
      caption: formatSampleLabelFromProperty('sampleList'),
      data: data?.sampleList || [],
    },
  };

  if (!sampleCollection.value) return null;
  return (
    <>
      <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
        {sampleCollection.label}:{' '}
        <Text as='span' fontWeight='normal'>
          {sampleCollection.value.toLocaleString()}
          {/* {sampleCollection?.unit} */}
        </Text>
      </Heading>

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
          getCells={props => (
            <Flex wordBreak='break-all' lineHeight='short' fontSize='sm' py={1}>
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
    </>
  );
};
