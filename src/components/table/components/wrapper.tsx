import React from 'react';
import {
  Box,
  BoxProps,
  SelectProps,
  createStylesContext,
  useMultiStyleConfig,
} from '@chakra-ui/react';

// Based on NIAID's Table Styles
// https://designsystem.niaid.nih.gov/components/atoms

// Table wrapper.
export interface TableWrapperProps extends BoxProps {
  variant?: string;
  colorScheme?: SelectProps['colorScheme'];
}

const [StylesProvider] = createStylesContext('Table');

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  variant,
  colorScheme,
  ...props
}) => {
  const styles = useMultiStyleConfig('Table', { variant, colorScheme });

  return (
    <Box __css={styles.wrapper} {...props}>
      <StylesProvider value={styles}>{children}</StylesProvider>
    </Box>
  );
};
