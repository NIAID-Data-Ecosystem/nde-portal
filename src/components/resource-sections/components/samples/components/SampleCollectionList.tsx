import { Heading, Text } from '@chakra-ui/react';
import { SampleCollection } from 'src/utils/api/types';
import { formatValue } from '../helpers';
import { Table } from 'src/components/table';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';
import { getSamplePropertyTableRows } from './SampleProperties/config';
import { Cell } from './SampleProperties/Cells';

interface SampleCollectionListProps {
  data: SampleCollection;
}

export const SampleCollectionList = ({ data }: SampleCollectionListProps) => {
  const aggregatePropertiesForDisplay = getSamplePropertyTableRows(
    data.aggregateElement || {},
  ).map(row => ({
    ...row,
    title: row.label,
    isSortable: true,
    renderCell: Cell.renderValuesCellRefactor,
  }));

  // Sample Collection
  const sampleCollection = {
    label: formatSampleLabelFromProperty('numberOfItems'),
    // unit: sample?.numberOfItems?.unitText
    //   ? `${formatUnitText(sample.numberOfItems.unitText)}${
    //       sample?.numberOfItems?.value !== 1 ? 's' : ''
    //     }`
    //   : '',
    value: data?.numberOfItems?.value,
    valueText: formatValue({
      value: data?.numberOfItems?.value,
      minValue: data?.numberOfItems?.minValue,
      maxValue: data?.numberOfItems?.maxValue,
    }),
    table: {
      caption: formatSampleLabelFromProperty('itemListElement'),
      rows: (data?.itemListElement || []).map(item => ({
        'itemListElement.identifier': item,
        ...data.aggregateElement,
      })),
      columns: [
        {
          title: 'Sample ID',
          property: 'itemListElement.identifier',
          isSortable: true,
          renderCell: Cell.renderValuesCellRefactor,
        },
        ...aggregatePropertiesForDisplay,
      ],
    },
  };

  // if (!sampleCollection.value) return null;
  return (
    <>
      {sampleCollection?.value && (
        <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
          {sampleCollection.label}:{' '}
          <Text as='span' fontWeight='normal'>
            {sampleCollection.value.toLocaleString()}
            {/* {sampleCollection?.unit} */}
          </Text>
        </Heading>
      )}

      {sampleCollection?.table?.rows?.length > 0 && (
        <Table
          ariaLabel={sampleCollection.table.caption}
          caption={sampleCollection.table.caption}
          data={sampleCollection.table.rows}
          tableContainerProps={{
            overflowY: 'auto',
            maxHeight: '400px',
          }}
          getTableRowProps={(_, idx) => ({
            bg: idx % 2 === 0 ? 'white' : 'page.alt',
          })}
          getCells={props => {
            const value = props.data?.[props.column.property];
            return props?.column?.renderCell?.({ ...props, data: value });
          }}
          // getCells={props => {
          //   return Cell.renderValuesCellRefactor(props);
          //   const datum = props.data?.[props.column.property];

          //   if (datum === undefined || datum === null) {
          //     return (
          //       <Flex
          //         wordBreak='break-all'
          //         lineHeight='short'
          //         fontSize='sm'
          //         py={1}
          //       >
          //         N/A
          //       </Flex>
          //     );
          //   } else if (typeof datum === 'number' || typeof datum === 'string') {
          //     return (
          //       <Flex
          //         wordBreak='break-all'
          //         lineHeight='short'
          //         fontSize='sm'
          //         py={1}
          //       >
          //         {props.data.url ? (
          //           <Link href={props.data.url} isExternal>
          //             {props.data?.[props.column.property]?.replace(/-/g, '-')}
          //           </Link>
          //         ) : (
          //           <>
          //             {props.data?.[props.column.property]?.replace(/-/g, '-')}
          //           </>
          //         )}
          //       </Flex>
          //     );
          //   } else if (Array.isArray(datum)) {
          //     return (
          //       <Flex
          //         flexDirection='column'
          //         gap={1}
          //         wordBreak='break-all'
          //         lineHeight='short'
          //         fontSize='sm'
          //         py={1}
          //       >
          //         {datum.map((item, index) => (
          //           <Text key={index}>
          //             {typeof item === 'string' || typeof item === 'number'
          //               ? item
          //               : item.name || JSON.stringify(item)}
          //           </Text>
          //         ))}
          //       </Flex>
          //     );
          //   } else if (typeof datum === 'object') {
          //     return (
          //       <Flex
          //         wordBreak='break-all'
          //         lineHeight='short'
          //         fontSize='sm'
          //         py={1}
          //       >
          //         {datum.name || JSON.stringify(datum)}
          //       </Flex>
          //     );
          //   } else {
          //     return (
          //       <Flex
          //         wordBreak='break-all'
          //         lineHeight='short'
          //         fontSize='sm'
          //         py={1}
          //       >
          //         {String(datum)}
          //       </Flex>
          //     );
          //   }
          // }}
          hasPagination
          columns={sampleCollection.table.columns}
        />
      )}
    </>
  );
};
