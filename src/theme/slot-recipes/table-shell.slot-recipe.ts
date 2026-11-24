import { defineSlotRecipe } from '@chakra-ui/react';

/*
The pagination bar the shared DataTable renders below its rows
(src/components/table/data-table/components/TablePagination.tsx). It lived on
the v2 `Table` style config as an ad-hoc part, read explicitly via
`useMultiStyleConfig('Table', ...)`, beside a `wrapper` part that went with the
legacy table.

It gets its own recipe rather than being appended to ./table.slot-recipe.ts
because it isn't part of Chakra's table anatomy. Chakra v3 merges config
arrays index-wise, so extra entries spliced onto `slots` would silently
overwrite real anatomy slots if the upstream order ever changed.

Consumers must set `colorPalette` on the same element that receives these
styles, so the `--chakra-colors-color-palette-*` variables exist to resolve
against. v2's fallback was `props.colorPalette ? \`${colorPalette}.200\` :
'gray.200'`, and gray is Chakra v3's global default palette, so an unset
`colorPalette` still lands on `gray.200`.
*/
export const tableShellSlotRecipe = defineSlotRecipe({
  className: 'nde-table-shell',
  slots: ['pagination'],
  base: {
    pagination: {
      display: 'flex',
      w: '100%',
      bg: '#fff',
      borderTop: '.0625rem solid',
      borderColor: 'colorPalette.200',
      flexDirection: ['column-reverse', 'row'],
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
  },
});
