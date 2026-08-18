import React from 'react';
import { Box, BoxProps, ColorPalette, useSlotRecipe } from '@chakra-ui/react';

// Based on NIAID's Table Styles
// https://designsystem.niaid.nih.gov/components/atoms

// Table wrapper.
export interface TableWrapperProps extends BoxProps {
  variant?: string;
  colorPalette?: ColorPalette;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  variant,
  colorPalette = 'gray',
  ...props
}) => {
  /*
   * `wrapper` is not part of Chakra's table anatomy, so it lives in its own
   * `tableShell` slot recipe rather than on `table`. See
   * src/theme/slot-recipes/table-shell.slot-recipe.ts.
   */
  const recipe = useSlotRecipe({ key: 'tableShell' });
  const styles = recipe();

  /*
   * `colorPalette` has to sit on the same element as the styles so the
   * `--chakra-colors-color-palette-*` variables the recipe references are in
   * scope. The v2 version also dropped a styles context here, but nothing ever
   * consumed it — TablePagination resolves its own styles.
   */
  return (
    <Box colorPalette={colorPalette} css={styles.wrapper} {...props}>
      {children}
    </Box>
  );
};
