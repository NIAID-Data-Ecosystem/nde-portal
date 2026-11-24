import React from 'react';
import { getConditionsOfAccessPreset } from 'src/components/badges';
import { getSearchableItemHref } from 'src/components/searchable-items';
import {
  AccessBadgeCell,
  ColumnDef,
  ExpandableText,
  LinkCell,
  LinkListCell,
  ResourceLinkCell,
  TagsCell,
  TermsCell,
  TermValue,
  toText,
} from 'src/components/table';
import { FormattedResource } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';

import {
  ExportEntries,
  exportLinks,
  exportResourceName,
  exportTerms,
  exportText,
} from './export';
import {
  normalizeTermNames,
  toCatalogEntry,
  toFunderEntries,
  toFundingIdEntries,
  toLicenseEntry,
  toTopicCategoryNames,
} from './shaping';

/*
Column definitions shared by the Search tables (./tables/*). Each is a function
returning a fresh definition, so a table can adjust one with overrides
(`resourceColumns.terms({ id: 'infectiousAgent', header: 'Pathogen', size: … })`,
or `{ ...resourceColumns.name(), size: … }`). Labels match the result cards'
wording; accessors shape API records with ./shaping.ts, and cells are the
shared DataTable cells, which show "No data" for missing values themselves.
*/

/**
 * A Search table column: a DataTable column over API records, plus the API's
 * sort field. Having an `apiSortField` is what makes a column sortable (see
 * `createSearchTable`), so the header can't offer a sort the API can't do.
 */
export type SearchColumnDef<TValue = any> = ColumnDef<
  FormattedResource,
  TValue
> & {
  apiSortField?: string;
  /**
   * The cell as the XLSX "Custom Result View" download writes it: the text
   * (and link) per value that `cell` shows (see ./export.ts). Needed whenever
   * `cell` is custom; otherwise the `type`'s default text is used.
   */
  exportEntries?: ExportEntries<TValue>;
};

/** Infers a column's value type from its `accessor`. */
export const searchColumn = <TValue,>(
  def: SearchColumnDef<TValue>,
): SearchColumnDef<TValue> => def;

/**
 * `resourceColumns.terms`' argument: a column definition whose `accessor` may
 * return any term-shaped value (it's read as `TermValue | TermValue[]`).
 */
type TermsColumnOptions = Omit<
  SearchColumnDef<TermValue | TermValue[]>,
  'accessor'
> & {
  accessor?: (row: FormattedResource) => unknown;
};

/** A `cell` for `{ label, url }` entries: one per line, "Show N More" past five. */
export const linkListCell = ({
  value,
  column,
}: {
  value: { label: string; url: string | null }[] | null;
  column: { header: string };
}) => <LinkListCell entries={value} toggleContext={column.header} />;

export const resourceColumns = {
  /** The record's name, linking to its resource page as the card's title does. */
  name: () =>
    searchColumn({
      id: 'name',
      header: 'Name',
      apiSortField: 'name.raw',
      size: { min: 200, max: 320 },
      accessor: row => ({
        label: row.name || toText(row.alternateName),
        id: row.id,
      }),
      cell: ({ value }) => (
        <ResourceLinkCell label={value.label} id={value.id} />
      ),
      exportEntries: exportResourceName,
    }),

  /** The record's first catalog, linked to its archived (or own) URL. */
  source: () =>
    searchColumn({
      id: 'source',
      header: 'Source',
      type: 'link',
      apiSortField: 'includedInDataCatalog.name',
      accessor: row => toCatalogEntry(row.includedInDataCatalog),
      cell: ({ value }) => (
        <LinkCell href={value?.url} label={value?.name} external />
      ),
      exportEntries: value =>
        exportLinks(value && [{ label: value.name, url: value.url }]),
    }),

  date: () =>
    searchColumn({
      id: 'date',
      header: 'Date',
      type: 'date',
      apiSortField: 'date',
    }),

  /** The same comma-joined list the card shows (ten at most), in three lines. */
  author: () =>
    searchColumn({
      id: 'author',
      header: 'Author',
      size: { min: 180, max: 280 },
      accessor: row => formatAuthorsList2String(row.author, ',', 10),
      cell: ({ value, column }) =>
        value ? (
          <ExpandableText
            text={value}
            noOfLines={3}
            toggleContext={column.header}
          />
        ) : null,
      // Every author, not just the ten the cell shows.
      exportEntries: (_, row) =>
        exportText(formatAuthorsList2String(row.author, ',')),
    }),

  /** The result card's access badge, with its explanatory tooltip. */
  conditionsOfAccess: () =>
    searchColumn({
      id: 'conditionsOfAccess',
      header: 'Conditions of Access',
      apiSortField: 'conditionsOfAccess',
      accessor: row => row.conditionsOfAccess,
      cell: ({ value }) => <AccessBadgeCell value={value} />,
      // The badge's label ("Open Access").
      exportEntries: value =>
        exportText(value && getConditionsOfAccessPreset(value).label),
      size: { min: 200 },
    }),

  description: () =>
    searchColumn({
      id: 'description',
      header: 'Description',
      type: 'longText',
    }),

  /**
   * A term-shaped property (DefinedTerms, QuantitativeValues or strings): one
   * per line, linked when a term has a url. Reads `row[id]` unless given an
   * `accessor`. Any other column field (`size`, `apiSortField`, `hideable`…)
   * overrides the default.
   */
  terms: ({ accessor, ...def }: TermsColumnOptions) =>
    searchColumn<TermValue | TermValue[]>({
      type: 'list',
      cell: ({ value, column }) => (
        <TermsCell values={value} toggleContext={column.header} />
      ),
      exportEntries: exportTerms,
      ...def,
      accessor: row =>
        (accessor
          ? accessor(row)
          : (row as unknown as Record<string, unknown>)[def.id]) as
          | TermValue
          | TermValue[],
    }),

  /**
   * Measurement techniques as terms, linked when available. Some carry an array
   * `name`; it's joined the way the card does.
   */
  measurementTechnique: (): SearchColumnDef<TermValue | TermValue[]> =>
    resourceColumns.terms({
      id: 'measurementTechnique',
      header: 'Measurement Technique',
      size: { min: 200 },
      accessor: row => normalizeTermNames(row.measurementTechnique),
    }),

  /** Funders by name, each linked to the funder's identifier. */
  funder: () =>
    searchColumn({
      id: 'funder',
      header: 'Funder',
      type: 'list',
      accessor: row =>
        toFunderEntries(row.funding)?.map(({ name, identifier }) => ({
          label: name,
          url: identifier,
        })) ?? null,
      cell: linkListCell,
      exportEntries: exportLinks,
    }),

  /** Funding identifiers, each linked to its funding URL. */
  fundingId: () =>
    searchColumn({
      id: 'fundingId',
      header: 'Funding ID',
      type: 'identifier',
      accessor: row =>
        toFundingIdEntries(row.funding)?.map(({ identifier, url }) => ({
          label: identifier,
          url,
        })) ?? null,
      cell: linkListCell,
      exportEntries: exportLinks,
    }),

  /**
   * Topic categories as tags, each starting a search for itself as the result
   * card's do (`topicCategory.name:"<name>"`).
   */
  topicCategory: () =>
    searchColumn({
      id: 'topicCategory',
      header: 'Topic Category',
      type: 'tags',
      accessor: row => toTopicCategoryNames(row.topicCategory),
      cell: ({ value, column }) => (
        <TagsCell
          values={value}
          toggleContext={column.header}
          getSearchHref={name =>
            getSearchableItemHref({
              name,
              value: name,
              field: 'topicCategory.name',
            })
          }
        />
      ),
      // The names only: the tags link to portal searches, not to the terms.
      exportEntries: exportText,
    }),

  /** The license title (as the cards format it), linked to its URL. */
  license: () =>
    searchColumn({
      id: 'license',
      header: 'License',
      type: 'link',
      accessor: row => toLicenseEntry(row.license),
      cell: ({ value }) => (
        <LinkCell href={value?.url} label={value?.title} external />
      ),
      exportEntries: value =>
        exportLinks(value && [{ label: value.title, url: value.url }]),
    }),
};
