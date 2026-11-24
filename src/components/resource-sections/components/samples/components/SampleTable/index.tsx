import { Heading, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import {
  ColumnDef,
  DataTable,
  SortState,
  TermsCell,
  TermValue,
  toText,
} from 'src/components/table/data-table';

import type { SampleColumn } from '../../helpers';

/*
The resource page's sample tables (the shared DataTable; see
src/components/table/data-table/README.md). Which columns show is decided by
the data (`../../helpers`, `../../config`); this turns those descriptors into
DataTable columns.

Every value goes through the shared term cell: strings, booleans, DefinedTerms
(linked when they have a url) and QuantitativeValues, a list one per line with
"Show N More" past five.

Each column is 248px of content, plus the cells' 2 × 16px padding: the legacy
table's 280px border-box minimum. Fixed, because the legacy columns sat at that
minimum whenever the table overflowed; with width to spare (one or two
columns), the browser shares it out between them, as the legacy columns grew.
*/

const COLUMN_SIZE = { min: 248, max: 248 };

const toValue = (row: object, property: string) =>
  (row as Record<string, unknown>)[property] as TermValue | TermValue[];

export const toSampleColumnDefs = <TRow extends object>(
  columns: SampleColumn[],
): ColumnDef<TRow>[] =>
  columns.map(({ title, property, valueProperty, isSortable }) => ({
    id: property,
    header: title,
    size: COLUMN_SIZE,
    accessor: row => toValue(row, valueProperty ?? property),
    // A column showing another field still sorts on its own `property`.
    sort:
      isSortable && valueProperty
        ? { value: (_value, row) => toText(toValue(row, property)) }
        : Boolean(isSortable),
    cell: ({ value, column }) => (
      <TermsCell values={value} toggleContext={column.header} />
    ),
  }));

// Sample rows have no field that's unique in every table (an aggregate's
// single row has no id at all); their order is stable.
const getSampleRowId = (_: unknown, index: number) => String(index);

interface SampleTableProps<TRow extends object> {
  /** The table's accessible name (its visually hidden caption). */
  label: string;
  header?: {
    title: string;
    description?: React.ReactNode;
  };
  columns: SampleColumn[];
  rows: TRow[];
  pagination?: boolean;
  initialSort?: SortState;
}

export const SampleTable = <TRow extends object>({
  label,
  header,
  columns,
  rows,
  pagination,
  initialSort,
}: SampleTableProps<TRow>) => {
  const columnDefs = useMemo(
    () => toSampleColumnDefs<TRow>(columns),
    [columns],
  );

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
      <DataTable
        label={label}
        data={rows}
        columns={columnDefs}
        getRowId={getSampleRowId}
        sort={initialSort ? { initial: initialSort } : undefined}
        pagination={pagination}
        // The legacy table's 400px cap was on its rows, with the pager below
        // it. DataTable's includes the pager, so a paginated table adds the
        // pager's height (82px from `sm`; below it the pager stacks, and the
        // rows get less room).
        maxHeight={pagination ? '482px' : '400px'}
      />
    </>
  );
};
