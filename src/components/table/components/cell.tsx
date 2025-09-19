import {
  Box,
  BoxProps,
  ButtonProps,
  Flex,
  FlexProps,
  Stack,
  Table,
  Text,
  TextProps,
} from '@chakra-ui/react';
import React from 'react';

import { TableSortToggle, TableSortToggleProps } from './sort-toggle';

// Label component - displays text in a specific style.
export const Label = React.memo(({ children, ...props }: TextProps) => {
  return (
    <Text
      fontSize='xs'
      color='gray.800'
      textTransform='uppercase'
      lineHeight='short'
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
      fontSize='xs'
      lineHeight='short'
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
}

// Cell component - defines the structure and style of a table cell.
export const Cell = React.memo(({ label, children, ...props }: CellProps) => {
  return (
    <Flex
      flex={1}
      px={4}
      py={1}
      minW='280px'
      fontSize='xs'
      lineHeight='short'
      {...props}
    >
      {label && <Label>{label}</Label>}
      {children && <Content>{children}</Content>}
    </Flex>
  );
});

export const EmptyCell = React.memo(({ label }: { label?: string }) => {
  return (
    <Text as='span' fontSize='xs' fontStyle='italic' color='gray.800'>
      {label || 'No data'}
    </Text>
  );
});

export const Th = React.memo(
  ({
    children,
    colorScheme,
    isSelected,
    label,
    isSortable,
    tableSortToggleProps,
    ...props
  }: ThProps) => {
    const bg = isSelected ? 'page.alt' : 'transparent';
    const py = isSortable ? 1 : 2;
    return (
      <Table.ColumnHeader
        as='th'
        role='columnheader'
        scope='col'
        alignItems='center'
        bg={bg}
        borderBottom='1px solid'
        borderBottomColor={`${colorScheme}.200`}
        flex={1}
        fontSize='xs'
        fontWeight='bold'
        justifyContent='flex-start'
        lineHeight='short'
        minW='280px'
        overflow='hidden'
        px={4}
        py={py}
        whiteSpace='pre-wrap'
        {...props}
      >
        {label && <Label>{label}</Label>}
        {isSortable && tableSortToggleProps && (
          <Box
            my={1}
            fontSize='xs'
            lineHeight='short'
            whiteSpace='pre-wrap'
            wordBreak='break-word'
            fontWeight='normal'
          >
            <TableSortToggle {...tableSortToggleProps} />
          </Box>
        )}
      </Table.ColumnHeader>
    );
  },
);

interface SortableHeaderCell extends CellProps {
  colorScheme?: ButtonProps['colorScheme'];
  isSelected?: boolean;
  isSortable?: boolean;
  tableSortToggleProps?: TableSortToggleProps;
}

export const SortableHeaderCell = ({
  label,
  isSortable,
  tableSortToggleProps,
}: SortableHeaderCell) => {
  return (
    <Stack flexDirection='row' lineHeight='shorter' alignItems='center' gap={2}>
      {label}
      {isSortable && tableSortToggleProps && (
        <TableSortToggle {...tableSortToggleProps} />
      )}
    </Stack>
  );
};
