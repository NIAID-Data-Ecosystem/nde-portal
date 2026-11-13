import { TableRootProps } from '@chakra-ui/react';
import React, { useContext } from 'react';

/** The table recipe's size scale, without the `ConditionalValue` wrapper. */
export type TableSize = NonNullable<Extract<TableRootProps['size'], string>>;

/*
The size given to the parent table, so its cells, headers and pagination can
follow it without threading a prop through every layer — including the
virtualized body, which renders no <table> for them to inherit styles from.

Provided by TableWrapper, which both Table and the tables assembled from
Chakra's parts render around everything else. Undefined when no size is
given, which leaves Cell / Th / TablePagination on their own defaults.
*/
const TableSizeContext = React.createContext<TableSize | undefined>(undefined);

export const TableSizeProvider = TableSizeContext.Provider;

// An explicit `size` overrides the one inherited from the parent Table.
export const useTableSize = (size?: TableSize) => {
  const inheritedSize = useContext(TableSizeContext);
  return size ?? inheritedSize;
};
