import { useMemo } from 'react';
import { FilterTermType } from 'src/views/search/components/filters/types';
import {
  FILTERABLE_REPOSITORY_MATCHER_COLUMNS,
  RepositoryMatcherColumn,
} from 'src/views/repository-matcher/table-config';
import { RepositoryMatcherRow } from './useRepositoryMatcherData';

export type SelectedRepositoryMatcherFilters = Record<string, string[]>;

const getRowValues = (
  row: RepositoryMatcherRow,
  col: RepositoryMatcherColumn<any>,
): string[] => col.filter?.getFilterValues(row[col.id]) ?? [];

const rowPassesColumn = (
  row: RepositoryMatcherRow,
  col: RepositoryMatcherColumn<any>,
  selected: string[],
): boolean => {
  if (!selected?.length) return true;
  const values = getRowValues(row, col);
  if (!values.length) return false;
  return values.some(v => selected.includes(v));
};

/**
 * Derives filter terms and the filtered row set for the repository matcher
 * table. Counts for each filterable column are computed against rows that
 * pass *every other* selected filter, mirroring the search page's facet
 * behavior — applying a filter narrows the counts of other facets but leaves
 * the current facet's options intact.
 */
export const useRepositoryMatcherFilters = (
  data: RepositoryMatcherRow[] | undefined,
  selected: SelectedRepositoryMatcherFilters,
) => {
  const filteredData = useMemo(() => {
    if (!data?.length) return data ?? [];
    return data.filter(row =>
      FILTERABLE_REPOSITORY_MATCHER_COLUMNS.every(col =>
        rowPassesColumn(row, col, selected[col.id] ?? []),
      ),
    );
  }, [data, selected]);

  const termsByColumnId = useMemo(() => {
    const result: Record<string, FilterTermType[]> = {};
    FILTERABLE_REPOSITORY_MATCHER_COLUMNS.forEach(col => {
      result[col.id] = [];
    });
    if (!data?.length) return result;

    for (const col of FILTERABLE_REPOSITORY_MATCHER_COLUMNS) {
      const scoped = data.filter(row =>
        FILTERABLE_REPOSITORY_MATCHER_COLUMNS.every(other => {
          if (other.id === col.id) return true;
          return rowPassesColumn(row, other, selected[other.id] ?? []);
        }),
      );
      // If using counts, use the following code.
      // const counts = new Map<string, number>();
      // for (const row of scoped) {
      //   for (const value of getRowValues(row, col)) {
      //     counts.set(value, (counts.get(value) ?? 0) + 1);
      //   }
      // }
      //  result[col.id] = Array.from(counts.entries())
      //   .map(([term, count]) => ({ term, label: term, count }))
      //   .sort(
      //     (a, b) =>
      //       b.count - a.count ||
      //       a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
      //   );

      const uniqueTerms = new Set<string>();
      for (const row of scoped) {
        for (const value of getRowValues(row, col)) {
          uniqueTerms.add(value);
        }
      }
      result[col.id] = Array.from(uniqueTerms)
        .map(term => ({ term, label: term }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
        );
    }
    return result;
  }, [data, selected]);

  return { filteredData, termsByColumnId };
};
