import { useCallback, useMemo, useState } from 'react';

// Hook handling table sort.
interface DataObject {
  [key: string]: any;
}

export const useTableSort = (
  /**
   * Table data
   */
  data: DataObject[],
  /**
   * Function to access the order value in data. Defaults to (v) => v. Must wrap in callback.
   */
  accessor: (arg: any) => any = v => v,

  /**
   * Initial order by value.
   */
  orderByInitial?: string,

  /**
   * Initial sort by boolean where Ascending[true] or descending[false]
   */
  isSortAscending?: boolean,
): any => {
  const accessorFn = useCallback(accessor, [accessor]);

  const [orderBy, setOrderBy] = useState<string | null>(orderByInitial || null);
  const [sortByAsc, setSortByAsc] = useState(isSortAscending);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }
    const d = [...data].sort((a, b) => {
      if (!orderBy) {
        return 1;
      }
      const value_a = accessorFn(a[orderBy]);
      const value_b = accessorFn(b[orderBy]);

      if (typeof value_a !== 'string' || typeof value_b !== 'string') {
        return 1;
      }

      if (sortByAsc) {
        return value_a.toLowerCase().localeCompare(value_b.toLowerCase());
      } else {
        return value_b.toLowerCase().localeCompare(value_a.toLowerCase());
      }
    });

    return d;
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
