import React from 'react';
import {
  AccessBadgeCell,
  ColumnDef,
  ExpandableText,
  LinkCell,
} from 'src/components/table';

import type { TableData } from '.';
import { formatDomainName, formatTypeName } from './helpers';

/*
Columns for the Home page's "Explore All Included Resources" table (the shared
DataTable; see src/components/table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. They're
the legacy table's border-box min/max widths minus that padding, so the columns
render as wide as before: Name 280px, Type 180px, Research Domain 225px and
Access 150px, with Description at least 280px and taking the rest.
*/

const SEMIBOLD: React.CSSProperties = { fontWeight: 600 };

/** Alphabetical and comma-joined, as the legacy cells showed them. */
const joinSorted = (values: string[]) =>
  [...values].sort((a, b) => a.localeCompare(b)).join(', ');

/** Semibold text, or the "No data" placeholder when there's none. */
const semiboldCell = ({ value }: { value: string }) =>
  value ? <span style={SEMIBOLD}>{value}</span> : null;

export const RESOURCES_TABLE_COLUMNS: ColumnDef<TableData>[] = [
  {
    id: 'name',
    header: 'Name',
    sort: true,
    size: { min: 248, max: 248 },
    // Links to the source's search results (a relative `/search` URL).
    cell: ({ row }) => (
      <LinkCell href={row.url} label={row.name} external={false} />
    ),
  },
  {
    id: 'abstract',
    header: 'Description',
    type: 'longText',
    size: { min: 248 },
    // Three lines before "Show More", as the legacy clamp (the shared default
    // is four).
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
    id: 'type',
    header: 'Type',
    sort: true,
    size: { min: 148, max: 148 },
    accessor: row => joinSorted((row.type ?? []).map(formatTypeName)),
    cell: semiboldCell,
  },
  {
    id: 'domain',
    header: 'Research Domain',
    sort: true,
    size: { min: 193, max: 193 },
    accessor: row => joinSorted(formatDomainName(row.domain)),
    cell: semiboldCell,
  },
  {
    id: 'conditionsOfAccess',
    header: 'Conditions of Access',
    sort: true,
    size: { min: 200 },
    cell: ({ value }) => <AccessBadgeCell value={value} />,
  },
];
