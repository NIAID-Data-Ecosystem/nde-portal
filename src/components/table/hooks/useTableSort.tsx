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
  isSortAscending,
}: TableSortProps): any => {
  const accessorFn = useCallback(accessor, [accessor]);

  const [orderBy, setOrderBy] = useState<string | null>(orderByInitial || null);
  const [sortByAsc, setSortByAsc] = useState(isSortAscending);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    const d = [...data].sort((a, b) => {
      if (!orderBy) {
        return 0; // Return 0 for no change in order when orderBy is not set
      }
      // Access values and treat nulls as empty strings
      let value_a = accessorFn(a[orderBy]);
      let value_b = accessorFn(b[orderBy]);

      // Treat null values as empty strings
      value_a = !value_a ? '' : value_a;
      value_b = !value_b ? '' : value_b;

      // No need to check if values are strings, as we are treating them as strings by default
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
