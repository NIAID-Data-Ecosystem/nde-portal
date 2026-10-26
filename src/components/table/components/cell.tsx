import {
  Box,
  BoxProps,
  ButtonProps,
  Flex,
  FlexProps,
  Text,
  TextProps,
} from '@chakra-ui/react';
import React from 'react';
import Tooltip from 'src/components/tooltip';

import { TableSize, useTableSize } from '../hooks/useTableSize';
import { TableSortToggle } from './sort-toggle';

/*
`Table.Root size` → the font size its cells and headers use. Matches the
`textStyle` Chakra's table recipe gives the root, so a cell reads the same
whether it inherits that from a <table> or sits in the virtualized body, which
renders none.
*/
const CELL_FONT_SIZE = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
} as const satisfies Record<TableSize, 'sm' | 'md'>;

// Label component - displays text in a specific style.
export const Label = React.memo(({ children, ...props }: TextProps) => {
  return (
    <Text
      color='gray.800'
      textTransform='uppercase'
      lineHeight='moderate'
      textAlign='start'
      {...props}
    >
      {children}
    </Text>
  );
});

// Content component - displays content within a styled Box.
export const Content = React.memo(({ children, ...props }: BoxProps) => {
  return (
    <Box
      className='content'
      my={2}
      lineHeight='moderate'
      whiteSpace='pre-wrap'
      wordBreak='break-word'
      fontWeight='normal'
      w='100%'
      h='100%'
      {...props}
    >
      {children}
    </Box>
  );
});

interface CellProps extends FlexProps {
  label?: string;
  scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
  children?: React.ReactNode;
  /**
   * Overrides the size inherited from the parent Table. Outside a Table, and
   * with no size given, the font size is inherited from the enclosing element.
   */
  size?: TableSize;
}

// Cell component - defines the structure and style of a table cell.
export const Cell = React.memo(
  ({ label, children, size, ...props }: CellProps) => {
    const tableSize = useTableSize(size);
    return (
      <Flex
        flex={1}
        px={4}
        py={1}
        minW='280px'
        fontSize={tableSize && CELL_FONT_SIZE[tableSize]}
        lineHeight='moderate'
        {...props}
      >
        {label && <Label>{label}</Label>}
        {children && <Content>{children}</Content>}
      </Flex>
    );
  },
);

// Inherits its font size from the enclosing cell.
export const EmptyCell = React.memo(({ label }: { label?: string }) => {
  return (
    <Text as='span' fontStyle='italic' color='gray.800'>
      {label || 'No data'}
    </Text>
  );
});

interface ThProps extends CellProps {
  colorPalette?: ButtonProps['colorPalette'];
  isSelected?: boolean;
  isSortable?: boolean;
  /** Optional descriptive text. */
  tooltip?: string;
  tableSortToggleProps?: {
    isSelected: boolean;
    sortBy: 'ASC' | 'DESC';
    handleToggle: (sortByAsc: boolean) => void;
  };
}

export const Th = React.memo(
  ({
    children,
    colorPalette,
    isSelected,
    label,
    isSortable,
    tooltip,
    tableSortToggleProps,
    size,
    ...props
  }: ThProps) => {
    const tableSize = useTableSize(size);
    const bg = isSelected ? 'bg.alt' : 'transparent';
    const py = isSortable ? 1 : 2;
    return (
      <Flex
        role='columnheader'
        scope='col'
        alignItems='center'
        bg={bg}
        borderBottom='1px solid'
        borderBottomColor={`${colorPalette}.200`}
        flex={1}
        fontSize={tableSize && CELL_FONT_SIZE[tableSize]}
        justifyContent='flex-start'
        lineHeight='moderate'
        minW='280px'
        overflow='hidden'
        px={4}
        py={py}
        whiteSpace='pre-wrap'
        {...props}
        asChild
      >
        <th>
          {label && (
            <Flex alignItems='center' gap={1}>
              <Tooltip content={tooltip}>
                <Box as='span' display='inline-flex'>
                  <Label color='gray.600' fontWeight='bold'>
                    {label}
                  </Label>
                </Box>
              </Tooltip>
            </Flex>
          )}
          {isSortable && tableSortToggleProps && (
            <Box
              my={1}
              lineHeight='moderate'
              whiteSpace='pre-wrap'
              wordBreak='break-word'
              fontWeight='normal'
            >
              <TableSortToggle {...tableSortToggleProps} />
            </Box>
          )}
        </th>
      </Flex>
    );
  },
);
