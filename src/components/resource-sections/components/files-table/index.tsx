import { Box, Flex, Icon, Span, Text } from '@chakra-ui/react';
import React from 'react';
import {
  ColumnDef,
  DataTable,
  ExpandableText,
  LinkCell,
  SortState,
} from 'src/components/table/data-table';
import { formatDate } from 'src/utils/api/helpers';
import { Distribution, FormattedResource } from 'src/utils/api/types';
import { formatNumber } from 'src/utils/helpers';

import { getFileIcon } from './helpers';

/*
The resource page's "File Downloads" table (the shared DataTable; see
src/components/table/data-table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. Each is the
legacy table's border-box minimum minus that padding (280, 180 and 200px), and
fixed: together the columns are wider than the resource page's content, so the
legacy columns always sat at their minimums. A page with width to spare shares
it out between them, as the legacy columns did.
*/

const fixed = (width: number) => ({ min: width, max: width });

/** Each format with its icon, then the file's size. */
const FileFormatCell = ({ file }: { file: Distribution }) => {
  const formats = (
    Array.isArray(file.encodingFormat)
      ? file.encodingFormat
      : [file.encodingFormat]
  ).filter((format): format is string => Boolean(format));

  return (
    <Box>
      {formats.map(format => {
        const { icon, color } = getFileIcon(format);
        return (
          <Text key={format} mb={1}>
            {format}
            {icon && <Icon as={icon} color={color || undefined} ml={2} />}
          </Text>
        );
      })}
      {file.contentSize != null && (
        <Text mb={1}>
          <strong>size: </strong> {formatNumber(file.contentSize)}
        </Text>
      )}
    </Box>
  );
};

/** A date column, shown and sorted as YYYY-MM-DD. */
const dateColumn = (
  id: 'dateCreated' | 'dateModified' | 'datePublished',
  header: string,
): ColumnDef<Distribution> => ({
  id,
  header,
  type: 'date',
  sort: true,
  size: fixed(168),
  accessor: row => formatDate(row[id]),
});

export const FILE_COLUMNS: ColumnDef<Distribution>[] = [
  {
    id: 'name',
    header: 'Name',
    sort: true,
    size: fixed(248),
    cell: ({ value }) => (value ? <Span lineClamp={3}>{value}</Span> : null),
  },
  {
    id: 'contentUrl',
    header: 'Download',
    type: 'link',
    sort: true,
    size: fixed(248),
    cell: ({ value }) =>
      value ? (
        <Span lineClamp={2}>
          <LinkCell href={value} external />
        </Span>
      ) : null,
  },
  {
    id: 'description',
    header: 'Description',
    type: 'longText',
    sort: true,
    size: fixed(248),
    // Three lines before "Show More", the legacy clamp (the shared default is
    // four).
    cell: ({ value, column }) =>
      value ? (
        <ExpandableText
          text={value}
          noOfLines={3}
          toggleContext={column.header}
        />
      ) : null,
  },
  {
    id: 'encodingFormat',
    header: 'File Format',
    sort: true,
    size: fixed(148),
    // The size shows under the formats, so a file with no format shows "No
    // data" here, as before, even when its size is known.
    cell: ({ value, row }) =>
      (Array.isArray(value) ? value.some(Boolean) : value) ? (
        <FileFormatCell file={row} />
      ) : null,
  },
  dateColumn('dateCreated', 'Date Created'),
  dateColumn('dateModified', 'Date Modified'),
  dateColumn('datePublished', 'Date Published'),
];

const INITIAL_SORT: SortState = { columnId: 'name', direction: 'asc' };

// Files often have no unique field (several can share a URL or have none),
// and their order in `distribution` is stable.
const getFileRowId = (_: Distribution, index: number) => String(index);

interface FilesTableProps {
  loading: boolean;
  distribution?: FormattedResource['distribution'];
}

const FilesTable: React.FC<FilesTableProps> = ({ loading, distribution }) => {
  if (!loading && !distribution?.length) {
    return (
      <Flex justifyContent='center'>
        <Text py={2}>No results found.</Text>
      </Flex>
    );
  }

  return (
    <DataTable
      label='List of downloadable files'
      data={distribution || []}
      columns={FILE_COLUMNS}
      getRowId={getFileRowId}
      sort={{ initial: INITIAL_SORT }}
      pagination
      status={{ loading }}
    />
  );
};

export default FilesTable;
