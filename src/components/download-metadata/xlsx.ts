import { MAX_CELL_CHARACTERS } from './helpers';

/*
 [XLSX "Custom Result View" export]:
 Builds an .xlsx file from a table-shaped description of the data, rather
 than from the raw API records like the JSON and CSV downloads do.

 A cell in Excel / OpenXML can only hold one clickable hyperlink, so a column
 whose cells contain several links is expanded into several numbered columns
 (e.g. "Topic Category 1", "Topic Category 2"), one link per cell. Columns
 that only contain plain text keep a single cell per row, joining multiple
 values with "; ".

 Columns with no data in any row are left out of the file.
*/

/** A single value shown in a cell, optionally linked to a url. */
export interface XlsxCellEntry {
  text: string;
  url?: string | null;
}

/** One column of the portal table, as it should appear in the xlsx file. */
export interface XlsxColumnSpec<TRow = Record<string, unknown>> {
  header: string;
  getEntries: (row: TRow) => XlsxCellEntry[];
}

export interface XlsxSheetSpec<TRow = Record<string, unknown>> {
  sheetName: string;
  columns: XlsxColumnSpec<TRow>[];
  rows: TRow[];
}

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Excel limits sheet names to 31 characters and disallows : \ / ? * [ ]
const MAX_SHEET_NAME_LENGTH = 31;
const toSheetName = (name: string) =>
  (
    name
      .replace(/[:\\/?*[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Results'
  ).slice(0, MAX_SHEET_NAME_LENGTH);

// Column width bounds, in characters.
const MIN_COLUMN_WIDTH = 12;
const MAX_COLUMN_WIDTH = 60;

const HEADER_STYLE = { font: { bold: true } };
const LINK_STYLE = { font: { color: { rgb: '0563C1' }, underline: true } };

const truncate = (text: string) =>
  text.length > MAX_CELL_CHARACTERS
    ? `${text.substring(0, MAX_CELL_CHARACTERS - 3)}...`
    : text;

const isValidUrl = (url?: string | null): url is string =>
  !!url && /^(https?:\/\/|mailto:|ftp:\/\/)/i.test(url.trim());

// Drop entries that carry neither text nor a link.
const cleanEntries = (entries: XlsxCellEntry[]) =>
  entries.filter(entry => entry && (entry.text || isValidUrl(entry.url)));

/**
 * The xlsx-level column layout for one portal column: either a single column,
 * or `count` numbered columns holding one linked entry each.
 */
interface ExpandedColumn {
  headers: string[];
  // Whether each entry gets its own column (true when the column has links
  // and at least one row holds more than one entry).
  isExpanded: boolean;
}

const expandColumn = (
  header: string,
  cellEntries: XlsxCellEntry[][],
): ExpandedColumn => {
  let maxEntries = 0;
  let hasLinks = false;
  cellEntries.forEach(entries => {
    maxEntries = Math.max(maxEntries, entries.length);
    if (!hasLinks) hasLinks = entries.some(entry => isValidUrl(entry.url));
  });

  if (hasLinks && maxEntries > 1) {
    return {
      headers: Array.from(
        { length: maxEntries },
        (_, idx) => `${header} ${idx + 1}`,
      ),
      isExpanded: true,
    };
  }
  return { headers: [header], isExpanded: false };
};

const toCell = (entry?: XlsxCellEntry) => {
  if (!entry) return null;
  const url = isValidUrl(entry.url) ? entry.url.trim() : null;
  const text = truncate(entry.text || url || '');
  if (!url) return text || null;
  return {
    value: text,
    hyperlink: { target: url },
    style: LINK_STYLE,
  };
};

// Several entries in a single cell: the text is joined, and the cell links to
// the only url when there is exactly one.
const toJoinedCell = (entries: XlsxCellEntry[]) => {
  if (entries.length === 0) return null;
  if (entries.length === 1) return toCell(entries[0]);
  return truncate(entries.map(entry => entry.text || entry.url).join('; '));
};

/**
 * Build the xlsx workbook bytes for a sheet description. hucre is loaded on
 * demand so it is only downloaded when a user requests an xlsx file.
 */
export const buildXlsxWorkbook = async <TRow>({
  sheetName,
  columns,
  rows,
}: XlsxSheetSpec<TRow>): Promise<Uint8Array> => {
  // Extract every cell's entries once: [column][row] => entries.
  const allEntriesByColumn = columns.map(column =>
    rows.map(row => cleanEntries(column.getEntries(row) || [])),
  );

  // Leave out columns with no data in any row. If every column is empty,
  // keep them all so the sheet still has headers.
  const nonEmptyIdx = columns
    .map((_, colIdx) => colIdx)
    .filter(colIdx =>
      allEntriesByColumn[colIdx].some(entries => entries.length > 0),
    );
  const keptIdx =
    nonEmptyIdx.length > 0 ? nonEmptyIdx : columns.map((_, colIdx) => colIdx);
  const keptColumns = keptIdx.map(colIdx => columns[colIdx]);
  const entriesByColumn = keptIdx.map(colIdx => allEntriesByColumn[colIdx]);

  const layout = keptColumns.map((column, colIdx) =>
    expandColumn(column.header, entriesByColumn[colIdx]),
  );

  const headerRow = layout.flatMap(({ headers }) =>
    headers.map(header => ({ value: header, style: HEADER_STYLE })),
  );

  const dataRows = rows.map((_, rowIdx) =>
    layout.flatMap(({ headers, isExpanded }, colIdx) => {
      const entries = entriesByColumn[colIdx][rowIdx];
      return isExpanded
        ? headers.map((__, entryIdx) => toCell(entries[entryIdx]))
        : [toJoinedCell(entries)];
    }),
  );

  // Size each column to its header, within sensible bounds.
  const columnDefs = layout.flatMap(({ headers }) =>
    headers.map(header => ({
      width: Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, header.length + 4),
      ),
    })),
  );

  const { writeXlsx } = await import('hucre/xlsx');

  return writeXlsx({
    sheets: [
      {
        name: toSheetName(sheetName),
        columns: columnDefs,
        rows: [headerRow, ...dataRows],
        freezePane: { rows: 1 },
      },
    ],
  });
};

export const downloadAsXlsx = async <TRow>(
  sheet: XlsxSheetSpec<TRow>,
  downloadName: string,
) => {
  if (!downloadName) return null;

  const bytes = await buildXlsxWorkbook(sheet);
  const blob = new Blob([bytes as BlobPart], { type: XLSX_MIME_TYPE });

  return { href: URL.createObjectURL(blob), download: `${downloadName}.xlsx` };
};
