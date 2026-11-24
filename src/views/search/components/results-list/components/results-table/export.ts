import { XlsxCellEntry } from 'src/components/download-metadata/xlsx';
import { FormattedResource } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';

import { BaseColumn } from './types';
import { resolveVisibleColumns } from './utils';

/*
 Plain-data counterparts of the shared cell renderers in `SharedCells.tsx`,
 used by each table's `getExportEntries` to build the XLSX "Custom Result
 View" download. Each returns the text (and link) a rendered cell shows, one
 entry per value.
*/

export type ExportEntriesGetter = (
  property: string,
  row: Record<string, unknown>,
) => XlsxCellEntry[];

/** Absolute url of a record's portal resource page, for the Name column. */
export const getResourcePageUrl = (id?: string | null): string | null => {
  if (!id || typeof window === 'undefined') return null;
  return `${window.location.origin}/resources?id=${encodeURIComponent(id)}`;
};

/** A single plain-text value, or nothing when it is empty. */
export const textEntries = (value: unknown): XlsxCellEntry[] =>
  value == null || value === '' ? [] : [{ text: String(value) }];

/** Mirrors `LinkOrTextCell` / `LinkListCell`: one entry per label/url pair. */
export const linkEntries = (
  entries?: { label: string; url: string | null }[] | null,
): XlsxCellEntry[] =>
  (entries ?? [])
    .filter(({ label, url }) => label || url)
    .map(({ label, url }) => ({ text: label || url || '', url }));

/** Mirrors `ResourceNameCell`: the name, linked to the portal resource page. */
export const nameEntries = (row: Record<string, unknown>): XlsxCellEntry[] => {
  const label = (row?.name as string) || (row?.alternateName as string) || '';
  if (!label) return [];
  return [{ text: label, url: getResourcePageUrl(row?.id as string) }];
};

/** The comma-joined author list the Author cell shows, uncapped. */
export const authorEntries = (value: unknown): XlsxCellEntry[] =>
  textEntries(
    formatAuthorsList2String(value as FormattedResource['author'], ','),
  );

/**
 * Build the XLSX column specs for a table: its visible columns in the user's
 * order (resolved exactly as the rendered table resolves them), each reading
 * its cell entries through the table's `getExportEntries`.
 */
export const buildExportColumns = <TColumn extends BaseColumn>({
  columns,
  visibleColumnIds,
  columnOrder,
  requiredColumnIds,
  getExportEntries,
}: {
  columns: TColumn[];
  visibleColumnIds?: string[];
  columnOrder?: string[];
  requiredColumnIds: readonly string[];
  getExportEntries: ExportEntriesGetter;
}) =>
  resolveVisibleColumns(
    columns,
    visibleColumnIds,
    columnOrder,
    requiredColumnIds,
  ).map(column => ({
    header: column.title,
    getEntries: (row: Record<string, unknown>) =>
      getExportEntries(column.property, row),
  }));
