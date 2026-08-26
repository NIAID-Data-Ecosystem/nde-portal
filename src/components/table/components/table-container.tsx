import React from 'react';
import { Table, TableScrollAreaProps } from '@chakra-ui/react';

/**
 * Chakra v3 replaced `TableContainer` with `Table.ScrollArea`. Re-exported here
 * so the prop type keeps a stable name for consumers.
 */
export type TableContainerProps = TableScrollAreaProps;

export const TableContainer = React.forwardRef<
  HTMLDivElement,
  TableContainerProps
>((props, ref) => {
  return (
    <Table.ScrollArea
      ref={ref}
      css={{
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '13px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '13px',
        },
        '&:hover': {
          '&::-webkit-scrollbar-thumb': {
            background: 'text.placeholder',
          },
        },
      }}
      {...props}
    >
      {props.children}
    </Table.ScrollArea>
  );
});

TableContainer.displayName = 'TableContainer';
