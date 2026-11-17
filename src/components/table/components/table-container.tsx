import { Table, TableScrollAreaProps } from '@chakra-ui/react';
import React from 'react';

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
      // The browser's own scrollbars, thinned and tinted, not
      // `::-webkit-scrollbar`: Chrome repaints a scroller with custom
      // scrollbars on every scroll step (see the dataTable slot recipe).
      css={{
        scrollbarWidth: 'thin',
        scrollbarColor: '{colors.gray.300} {colors.blackAlpha.100}',
      }}
      {...props}
    >
      {props.children}
    </Table.ScrollArea>
  );
});

TableContainer.displayName = 'TableContainer';
