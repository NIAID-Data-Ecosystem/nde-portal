import {
  FormatNumber,
  HStack,
  Span,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { getMetadataName } from 'src/components/metadata';
import { LinkCell } from 'src/components/table/data-table/cells';
import type { SortState } from 'src/components/table/data-table/types';
import { toSearchValue } from 'src/components/table/data-table/utils/values';
import Tooltip from 'src/components/tooltip';
import { useUserData } from 'src/hooks/useUserData';
import { findSavedQueryIndex } from 'src/hooks/useUserData/helpers';
import { SavedQuery } from 'src/hooks/useUserData/types';
import { formatDate } from 'src/utils/api/helpers';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import {
  FILTER_CONFIGS,
  queryFilterObject2String,
} from '../search/components/filters';
import { generateTags } from '../search/components/filters/components/tag/utils';
import {
  APPLY_DEFAULT_DATE_FILTER_KEY,
  APPLY_DEFAULT_DATE_PARAM,
} from '../search/config/defaultQuery';
import { SavedColumnDef, SavedResourceItem, SavedRow } from './types';

/*
Columns for the Saved page's two tables (the shared DataTable; see
src/components/table/data-table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. They're
the legacy table's border-box widths minus that padding, so the columns keep
their old minimums (and maximums, where they had one). The name columns had no
bounds: they keep the 248px (280px with padding) the legacy table gave them at
least. Within those bounds the widths follow the content (native table
layout), where the legacy virtualized rows shared the width out evenly.
*/

/****** Cell helpers ******/

/** Leading quotes don't count when sorting names (`"Asthma"` sorts under A). */
const normalizeNameSortValue = (value?: string) =>
  (value ?? '')
    .trim()
    .replace(/^[`'"]+/, '')
    .toLowerCase();

/** Saved timestamps sort by time, not text (their offsets vary). */
const toTimestamp = (value?: string) => (value ? Date.parse(value) : null);

/** The search box matches the dates as shown: YYYY-MM-DD. */
const searchDate = (value?: string) => formatDate(value);

/**
 * A saved query's filter as a subtle, secondary tag, clamped to one line. When
 * it's cut off, hovering it shows the full text.
 */
const FilterTag = ({ label }: { label: string }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = labelRef.current;
    if (el) {
      setIsTruncated(
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      );
    }
  }, [label]);

  return (
    <Tooltip content={label} disabled={!isTruncated}>
      <Tag.Root
        variant='subtle'
        size='sm'
        rounded='full'
        colorPalette='secondary'
      >
        <Tag.Label ref={labelRef} lineClamp={1}>
          {label}
        </Tag.Label>
      </Tag.Root>
    </Tooltip>
  );
};

/****** Name cells (with the bookmark toggle) ******/

const SavedResourceNameCell = ({ item }: { item: SavedResourceItem }) => {
  const { savedDatasets, addSavedDataset, removeSavedDataset } = useUserData();
  const isFavorited = savedDatasets.some(
    ds => ds.dataset_id === item.dataset_id,
  );
  return (
    <HStack alignItems='flex-start' mt={-1}>
      <BookmarkIconButton
        isFavorited={isFavorited}
        onClick={() =>
          isFavorited
            ? removeSavedDataset(item.dataset_id)
            : addSavedDataset(item)
        }
      />
      <VStack alignItems='flex-start' gap={1} pt={1}>
        <Span lineClamp={2}>
          <LinkCell
            href={`/resources?id=${item.dataset_id}`}
            label={item.name}
            external={false}
          />
        </Span>
        <Text fontSize='xs' color='gray.500'>
          ID: {item.dataset_id}
        </Text>
      </VStack>
    </HStack>
  );
};

/** The search a saved query opens, with its filters. */
const getSavedQueryUrl = (item: SavedQuery) => {
  // The reserved opt-out marker is stored inside the saved filters but must
  // travel as a URL param, not inside the serialized filter string.
  const filters = item.filters || {};
  const filterString = queryFilterObject2String(filters) || '';
  // If no explicit date is present and the user has opted out of the default
  // date range, add the opt-out param to the URL so it doesn't add the
  // default date.
  const applyDefaultDateParam =
    !filters.date || filters[APPLY_DEFAULT_DATE_FILTER_KEY] === false
      ? `&${APPLY_DEFAULT_DATE_PARAM}=false`
      : '';
  return `/search?q=${encodeURIComponent(
    item.query,
  )}&filters=${encodeURIComponent(filterString)}${applyDefaultDateParam}`;
};

const SavedQueryNameCell = ({ item }: { item: SavedQuery }) => {
  const { savedQueries, addSavedQuery, removeSavedQuery } = useUserData();
  // Match on query AND filters: the same query string can be saved more than
  // once with different filters, and each must be favorited/removed on its own.
  const isFavorited = findSavedQueryIndex(savedQueries, item) !== -1;
  return (
    <HStack alignItems='flex-start' mt={-1}>
      <BookmarkIconButton
        isFavorited={isFavorited}
        aria-label={isFavorited ? 'Remove saved query' : 'Save query'}
        onClick={() =>
          isFavorited ? removeSavedQuery(item) : addSavedQuery(item)
        }
      />
      {/* The padding lines the name up with the middle of the button. */}
      <Span lineClamp={2} pt={1}>
        <LinkCell
          href={getSavedQueryUrl(item)}
          label={item.name || item.query}
          external={false}
        />
      </Span>
    </HStack>
  );
};

/****** Saved resources ******/

export const SAVED_RESOURCE_COLUMNS: SavedColumnDef<SavedResourceItem>[] = [
  {
    id: 'name',
    header: getMetadataName('name') || 'Name',
    accessor: row => row.item.name,
    sort: { value: normalizeNameSortValue },
    size: { min: 248, max: undefined },
    cell: ({ row }) => <SavedResourceNameCell item={row.item} />,
  },
  {
    id: 'type',
    header: getMetadataName('type') || 'Type',
    accessor: row =>
      row.item.type ? formatAPIResourceTypeForDisplay(row.item.type) : '',
    sort: true,
    // The 180px it had on desktop, where "Computational Tool" fits on a line.
    size: { min: 148, max: 148 },
    cell: ({ value }) =>
      value ? (
        <Span fontWeight='semibold' lineClamp={2}>
          {value}
        </Span>
      ) : null,
  },
  {
    id: 'source',
    header: 'Source',
    accessor: row => row.item.source ?? [],
    sort: true,
    size: { min: 128, max: 188 },
    cell: ({ value }) =>
      value.length ? <Span lineClamp={2}>{value.join(', ')}</Span> : null,
  },
  {
    id: 'dateModified',
    header: 'Updated On',
    type: 'date',
    accessor: row => row.item.dateModified,
    sort: { value: toTimestamp },
    size: { min: 128, max: 168 },
    search: searchDate,
  },
  {
    id: 'saved_at',
    header: 'Saved On',
    type: 'date',
    accessor: row => row.item.saved_at,
    sort: { value: toTimestamp },
    size: { min: 168, max: 168 },
    search: searchDate,
  },
];

export const SAVED_RESOURCE_INITIAL_SORT: SortState = {
  columnId: 'name',
  direction: 'asc',
};

/****** Saved queries ******/

// Convert filter config list to map for quick access
const configMap = Object.fromEntries(
  FILTER_CONFIGS.map(cfg => [cfg.property, cfg]),
);

export const SAVED_QUERY_COLUMNS: SavedColumnDef<SavedQuery>[] = [
  {
    id: 'total_count',
    header: 'Total',
    type: 'number',
    // Left-aligned as before: the header's title would stay at the start
    // over right-aligned numbers.
    align: 'start',
    accessor: row => row.item.total,
    size: { min: 68, max: 68 },
    cell: ({ value }) =>
      value == null ? null : (
        <Span fontWeight='semibold'>
          <FormatNumber value={value} />
        </Span>
      ),
  },
  {
    id: 'name',
    header: 'Name',
    accessor: row => row.item.name || row.item.query,
    sort: { value: normalizeNameSortValue },
    size: { min: 248, max: undefined },
    search: (_, item) => `${item.name} ${item.query}`,
    cell: ({ row }) => <SavedQueryNameCell item={row.item} />,
  },
  {
    id: 'filters',
    header: 'Applied Filters',
    accessor: (row): string[] =>
      generateTags(row.item.filters, configMap).map(
        tag => `${tag.name}: ${tag.displayValue}`,
      ),
    size: { min: 168, max: undefined },
    cell: ({ value }) =>
      value.length ? (
        <HStack flexWrap='wrap' gap={1}>
          {value.map((label: string, index: number) => (
            <FilterTag key={`${index}-${label}`} label={label} />
          ))}
        </HStack>
      ) : null,
  },
  {
    id: 'saved_at',
    header: 'Saved On',
    type: 'date',
    accessor: row => row.item.saved_at,
    sort: { value: toTimestamp },
    size: { min: 168, max: 168 },
    search: searchDate,
  },
];

/**
 * The legacy table's starting order: Total, ascending. Total itself has no
 * sort button, so once another column is sorted there's no way back to it
 * short of reloading.
 */
export const SAVED_QUERY_INITIAL_SORT: SortState = {
  columnId: 'total_count',
  direction: 'asc',
};

/****** Rows ******/

/**
 * Builds table rows from saved items: dedupes them by `getRowId` and prebuilds
 * a lowercase `_search` blob, so search matches against every column.
 */
export const formatTableData = <TItem,>(
  data: TItem[],
  columns: SavedColumnDef<TItem>[],
  getRowId: (item: TItem, index: number) => string,
): SavedRow<TItem>[] => {
  const rows: SavedRow<TItem>[] = [];
  const seen = new Set<string>();

  data.forEach((item, idx) => {
    const id = getRowId(item, idx) || `__no-id-${idx}`;
    if (seen.has(id)) return;
    seen.add(id);
    const row: SavedRow<TItem> = { _id: id, _search: '', item };
    const searchParts: string[] = [];
    for (const col of columns) {
      const value = col.accessor(row);
      const searchValue = col.search
        ? col.search(value, item)
        : toSearchValue(value);
      if (searchValue == null) continue;
      searchParts.push(
        Array.isArray(searchValue) ? searchValue.join(' ') : searchValue,
      );
    }
    row._search = searchParts.join(' ').toLowerCase();
    rows.push(row);
  });
  return rows;
};
