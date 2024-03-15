import React from 'react';
import {
  Box,
  BoxProps,
  ButtonProps,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Text,
} from '@chakra-ui/react';
import { TableSortToggle } from './sort-toggle';

// Label component - displays text in a specific style.
export const Label = React.memo(({ children, ...props }: HeadingProps) => {
  return (
    <Heading
      as='h4'
      fontSize='13px'
      color='gray.800'
      textTransform='uppercase'
      {...props}
    >
      {children}
    </Heading>
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

interface ThProps extends CellProps {
  colorScheme?: ButtonProps['colorScheme'];
  isSelected?: boolean;
  isSortable?: boolean;
  tableSortToggleProps?: {
    isSelected: boolean;
    sortBy: 'ASC' | 'DESC';
    handleToggle: (sortByAsc: boolean) => void;
  };
}

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
      <Flex
        as='th'
        role='columnheader'
        scope='col'
        label={label}
        alignItems='center'
        fontWeight='bold'
        bg={bg}
        borderBottom='1px solid'
        borderBottomColor={`${colorScheme}.200`}
        overflow='hidden'
        flex={1}
        px={4}
        py={py}
        minW='280px'
        fontSize='xs'
        lineHeight='short'
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
      </Flex>
    );
  },
);
