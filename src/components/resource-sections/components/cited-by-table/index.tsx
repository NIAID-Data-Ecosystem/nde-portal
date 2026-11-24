import { Span, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import {
  ColumnDef,
  DataTable,
  LinkCell,
} from 'src/components/table/data-table';
import { TagWithUrl } from 'src/components/tag-with-url';
import { formatDate } from 'src/utils/api/helpers';
import { CitedBy as CitedByType } from 'src/utils/api/types';

import { ContentHeader, ContentHeaderProps } from '../section';

/*
The resource page's "Cited By" table (the shared DataTable; see
src/components/table/data-table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. Each is the
legacy table's border-box width minus that padding (280px, and 200px for the
date), fixed: the legacy columns overflowed the resource page's content, so
they sat at those widths.
*/

const fixed = (width: number) => ({ min: width, max: width });

/** The title (linked when it has a url) and the work's ID, PMID and DOI. */
const NameCell = ({ item }: { item: CitedByType }) => (
  <>
    {item.url ? (
      <Span lineClamp={3}>
        <LinkCell href={item.url} label={item.name || item.url} external />
      </Span>
    ) : (
      <Text fontWeight='medium' lineClamp={3} mb={2}>
        {item.name || '[No title provided]'}
      </Text>
    )}
    <Stack gap={1} mt={1}>
      {item.identifier && (
        <TagWithUrl label='ID |'>{item.identifier}</TagWithUrl>
      )}
      {item.pmid && <TagWithUrl label='PMID |'>{item.pmid}</TagWithUrl>}
      {item.doi && <TagWithUrl label='DOI |'>{item.doi}</TagWithUrl>}
    </Stack>
  </>
);

export const CITED_BY_COLUMNS: ColumnDef<CitedByType>[] = [
  {
    id: 'name',
    header: 'Name',
    sort: true,
    size: fixed(248),
    // "No data" only when there's nothing at all to show.
    cell: ({ row }) =>
      row.name || row.url || row.identifier || row.pmid || row.doi ? (
        <NameCell item={row} />
      ) : null,
  },
  {
    id: '@type',
    header: 'Type',
    sort: true,
    size: fixed(248),
  },
  {
    id: 'journalName',
    header: 'Journal',
    sort: true,
    size: fixed(248),
    cell: ({ value }) => (value ? <Span lineClamp={3}>{value}</Span> : null),
  },
  {
    id: 'datePublished',
    header: 'Date Published',
    type: 'date',
    sort: true,
    size: fixed(168),
    accessor: row => formatDate(row.datePublished),
  },
];

// Their order in the record is stable, and nothing in them is unique.
const getCitedByRowId = (_: CitedByType, index: number) => String(index);

interface CitedByTableProps {
  loading: boolean;
  data: CitedByType[];
  title?: ContentHeaderProps['title'];
  subtitle?: ContentHeaderProps['subtitle'];
}

// Renders a table with citedby data.
export const CitedByTable: React.FC<CitedByTableProps> = ({
  data,
  loading,
  title,
  subtitle,
}) => {
  if (!loading && data.length === 0) {
    return <Text>No data available.</Text>;
  }

  return (
    <Stack gap={4}>
      {title && (
        <ContentHeader
          title={title}
          subtitle={subtitle}
          titleProps={{ as: 'h4' }}
        />
      )}
      <DataTable
        label='Cited by information'
        data={data}
        columns={CITED_BY_COLUMNS}
        getRowId={getCitedByRowId}
        pagination
        status={{ loading }}
      />
    </Stack>
  );
};
