import { Heading, Text } from '@chakra-ui/react';
import { Column, Table, TableProps } from 'src/components/table';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';

interface SamplePropertiesProps {
  caption: string;
  label: string;
  header?: {
    title: string;
    description?: React.ReactNode;
  };
  tableProps?: Partial<TableProps<any>>;
  getRows?: (
    data: SampleAggregate | SampleCollection,
  ) => TableProps<any>['data'][];
  getColumns?: (data: SampleAggregate | SampleCollection) => Column[];
}

export const SampleTable = ({
  label,
  caption,
  header,
  tableProps,
}: SamplePropertiesProps) => {
  return (
    <>
      {header?.title && (
        <Heading as='h4' fontSize='sm' mx={1} mb={2} fontWeight='semibold'>
          {header.title}
          {header?.description && (
            <Text as='span' fontWeight='normal'>
              {header.description}
            </Text>
          )}
        </Heading>
      )}

      <Table
        ariaLabel={label}
        caption={caption}
        tableContainerProps={{
          overflowY: 'auto',
          maxHeight: '400px',
        }}
        getTableRowProps={(_, idx) => ({
          bg: idx % 2 === 0 ? 'white' : 'page.alt',
        })}
        columns={tableProps?.columns || []}
        data={tableProps?.data || []}
        getCells={props =>
          tableProps?.getCells?.(props) ||
          props?.column?.renderCell?.(props) ||
          null
        }
        {...tableProps}
      />
    </>
  );
};
