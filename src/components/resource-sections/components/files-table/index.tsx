import React from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Distribution, FormattedResource } from 'src/utils/api/types';
import { Table } from 'src/components/table';
import { Link } from 'src/components/link';
import { EmptyCell } from 'src/components/table/components/cell';
import { getFileIcon } from 'src/components/table/helpers';
import { formatNumber } from 'src/utils/helpers';

interface FilesTableProps {
  isLoading: boolean;
  distribution?: FormattedResource['distribution'];
}

const FilesTable: React.FC<FilesTableProps> = ({ isLoading, distribution }) => {
  return (
    <>
      {!isLoading && !distribution?.length ? (
        <Flex justifyContent='center'>
          <Text py={2}>No results found.</Text>
        </Flex>
      ) : (
        <Table
          ariaLabel='List of downloadable files.'
          caption='List of downloadable files.'
          data={distribution || []}
          tableContainerProps={{ overflowY: 'auto' }}
          getCells={props => <DistributionCells {...props} />}
          isLoading={isLoading}
          hasPagination
          columns={[
            {
              title: 'Name',
              property: 'name',
              isSortable: true,
            },
            {
              title: 'Download',
              property: 'contentUrl',
              isSortable: true,
            },
            {
              title: 'Description',
              property: 'description',
              isSortable: true,
            },
            {
              title: 'File Format',
              property: 'encodingFormat',
              isSortable: true,
              props: { w: '180px', minW: '180px' },
            },
            {
              title: 'Date Created',
              property: 'dateCreated',
              isSortable: true,
              props: { w: '200px', minW: '200px' },
            },
            {
              title: 'Date Modified',
              property: 'dateModified',
              isSortable: true,
              props: { w: '200px', minW: '200px' },
            },
            {
              title: 'Date Published',
              property: 'datePublished',
              isSortable: true,
              props: { w: '200px', minW: '200px' },
            },
          ]}
        />
      )}
    </>
  );
};

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
}
export const DistributionCells = ({
  column,
  data,
}: {
  column: Column;
  data: Distribution;
}) => {
  if (!data?.[column.property as keyof Distribution]) {
    return <EmptyCell />;
  }
  const { icon: formatIcon, color } =
    column.property === 'encodingFormat' && data?.encodingFormat
      ? getFileIcon(data?.encodingFormat)
      : { icon: null, color: null };
  return (
    <>
      <Flex
        alignItems={['flex-start', 'center']}
        flexDirection={['column', 'row']}
        justifyContent='flex-start'
        {...column.props}
      >
        {column.property === 'contentUrl' && (
          <Link href={data?.[column.property] || ''} isExternal noOfLines={2}>
            {data?.[column.property]}
          </Link>
        )}
        {(column.property === 'name' ||
          column.property === 'description' ||
          column.property === 'dateCreated' ||
          column.property === 'dateModified' ||
          column.property === 'datePublished') && (
          <Text fontSize='xs' noOfLines={3}>
            {data[column.property]}
          </Text>
        )}
        {column.property === 'encodingFormat' && (
          <Box>
            {column.property === 'encodingFormat' && (
              <Text size='sm' fontSize='xs' mb={1}>
                {data[column.property]}
                {formatIcon && (
                  <Icon as={formatIcon} color={color || undefined} ml={2} />
                )}
              </Text>
            )}
            {data?.['contentSize'] && (
              <Text size='sm' fontSize='xs' mb={1}>
                <strong>size: </strong> {formatNumber(data['contentSize'])}
              </Text>
            )}
          </Box>
        )}
      </Flex>
    </>
  );
};

export default FilesTable;
