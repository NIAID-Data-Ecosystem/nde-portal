import React from 'react';
import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Text,
} from '@chakra-ui/react';

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
      my={2}
      fontSize='xs'
      lineHeight='short'
      whiteSpace='pre-wrap'
      wordBreak='break-word'
      fontWeight='normal'
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
