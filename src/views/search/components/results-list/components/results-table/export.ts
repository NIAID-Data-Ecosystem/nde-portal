import type { CustomViewExport } from 'src/components/download-metadata';
import type { XlsxCellEntry } from 'src/components/download-metadata/xlsx';
import {
  LinkEntry,
  TermValue,
  toTermEntry,
  toText,
} from 'src/components/table';
import { formatDate } from 'src/utils/api/helpers';
import { FormattedResource } from 'src/utils/api/types';

import type { SearchColumnDef } from './columns';

/*
The XLSX "Custom Result View" download of a Search table: its visible columns,
in the user's order, each cell as the text (and link) the table shows, one
entry per value.

A column with a custom `cell` gives its plain-data counterpart as
`exportEntries`, built from the helpers below. A column without one exports
its value as its `type`'s default cell shows it (only `date` and the text
types are used by Search columns without a custom cell).
*/

/** A column's cell as XLSX entries, from its accessor's value. */
export type ExportEntries<TValue = any> = (
  value: TValue,
  row: FormattedResource,
) => XlsxCellEntry[];

/** Absolute url of a record's portal resource page, for the Name column. */
export const getResourcePageUrl = (id?: string | null): string | null => {
  if (!id || typeof window === 'undefined') return null;
  return `${window.location.origin}/resources?id=${encodeURIComponent(id)}`;
};

/** Plain text, one entry per string; nothing for empty ones. */
export const exportText = (
  text?: string | (string | null | undefined)[] | null,
): XlsxCellEntry[] =>
  (Array.isArray(text) ? text : [text])
    .filter((value): value is string => !!value)
    .map(value => ({ text: value }));

/**
 * Mirrors `LinkCell` / `LinkListCell`: one entry per label/url pair, the url
 * standing in for a missing label, and a `www.` url given its scheme.
 */
export const exportLinks = (entries?: LinkEntry[] | null): XlsxCellEntry[] =>
  (entries ?? [])
    .filter(({ label, url }) => label || url)
    .map(({ label, url }) => ({
      text: label || url || '',
      url: url && /^www\./i.test(url) ? `https://${url}` : url ?? null,
    }));

/** Mirrors `TermsCell`: one entry per term, linked when it has a url. */
export const exportTerms = (
  values?: TermValue | TermValue[],
): XlsxCellEntry[] =>
  (Array.isArray(values) ? values : [values]).flatMap(term => {
    const entry = toTermEntry(term);
    return entry ? [entry] : [];
  });

/** Mirrors `ResourceLinkCell`: the name, linked to the portal resource page. */
export const exportResourceName = (value?: {
  label?: string | null;
  id?: string | null;
}): XlsxCellEntry[] =>
  value?.label
    ? [{ text: value.label, url: getResourcePageUrl(value.id) }]
    : [];

/** What a column without `exportEntries` exports (its default cell's text). */
const exportDefault = (
  type: SearchColumnDef['type'],
  value: unknown,
): XlsxCellEntry[] =>
  type === 'date'
    ? exportText(
        formatDate(typeof value === 'string' ? value : null) ?? toText(value),
      )
    : exportText(toText(value));

/**
 * Describes a Search table's view for the XLSX download: the columns in
 * `visibleIds` (in that order), each reading its accessor's value as the
 * table does.
 */
export const buildCustomViewExport = ({
  sheetName,
  columns,
  visibleIds,
}: {
  sheetName: string;
  columns: SearchColumnDef[];
  visibleIds: string[];
}): CustomViewExport => {
  const visible = visibleIds
    .map(id => columns.find(column => column.id === id))
    .filter((column): column is SearchColumnDef => !!column)
    .map(column => {
      const getValue =
        column.accessor ??
        ((row: FormattedResource) =>
          (row as unknown as Record<string, unknown>)[column.id]);
      const toEntries: ExportEntries =
        column.exportEntries ?? (value => exportDefault(column.type, value));
      return {
        id: column.id,
        header: column.header,
        getEntries: (row: FormattedResource) => toEntries(getValue(row), row),
      };
    });

  return {
    sheetName,
    // Each row holds its cells' entries by column id, so every value is read
    // and formatted once, however often the file builder asks for it.
    toRow: resource =>
      Object.fromEntries(
        visible.map(column => [column.id, column.getEntries(resource)]),
      ),
    columns: visible.map(({ id, header }) => ({
      header,
      getEntries: row => (row[id] as XlsxCellEntry[] | undefined) ?? [],
    })),
  };
};
