import { useCallback, useMemo, useState } from 'react';

// Hook handling table sort.
interface DataObject {
  [key: string]: any;
}

interface TableSortProps {
  /**
   * Table data
   */
  data: DataObject[];
  /**
   * Function to access the order value in data. Defaults to (v) => v. Must wrap in callback.
   */
  accessor?: (arg: any) => any;
  /**
   * Initial order by value.
   */
  orderBy?: string;
  /**
   * Initial sort by boolean where Ascending[true] or descending[false]
   */
  isSortAscending?: boolean;
}
export const useTableSort = ({
  data,
  accessor = v => v,
  orderBy: orderByInitial,
  isSortAscending = true,
}: TableSortProps): any => {
  const accessorFn = useCallback(accessor, [accessor]);
  const [orderBy, setOrderBy] = useState<string | null>(orderByInitial || null);
  const [sortByAsc, setSortByAsc] = useState(isSortAscending);

  const items = useMemo(() => {
    if (!data || !orderBy) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      let valueA = accessorFn(a[orderBy]);
      let valueB = accessorFn(b[orderBy]);

      // Normalize null or undefined to either 0 or '' depending on type (number vs. otherwise)
      valueA = valueA ?? (typeof valueA === 'number' ? 0 : '');
      valueB = valueB ?? (typeof valueB === 'number' ? 0 : '');
      // Check if values are numeric and use appropriate comparison
      const comparisonResult =
        typeof valueA === 'number' && typeof valueB === 'number'
          ? valueA - valueB
          : String(valueA).localeCompare(String(valueB), undefined, {
              sensitivity: 'base',
              numeric: true,
            });
      return sortByAsc ? comparisonResult : -comparisonResult;
    });

    return sorted;
  }, [accessorFn, data, orderBy, sortByAsc]);

  const handleSortOrder = useCallback(
    (orderKey: string, sortAsc?: boolean) => {
      setSortByAsc(() => {
        if (sortAsc !== undefined) {
          return sortAsc;
        }
        // if the order category hasn't changed we switch the order. Otherwise we default to starting with an ascending state.
        else if (orderKey === orderBy) {
          return !sortByAsc;
        } else {
          return true;
        }
      });

      setOrderBy(orderKey);
    },
    [orderBy, sortByAsc],
  );

  return [
    { data: items, sortBy: sortByAsc ? 'ASC' : 'DESC', orderBy },
    handleSortOrder,
  ];
};
