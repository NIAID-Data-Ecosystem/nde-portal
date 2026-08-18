import { defineSlotRecipe } from '@chakra-ui/react';

/*
Table styles based on: https://designsystem.niaid.nih.gov/components/atoms

Ported from the v2 `Table` style config, minus two things:

  - v2 declared `parts: ['pagination', 'wrapper', 'caption']` but returned six
    keys. `parts` was inert in v2, and neither `pagination` nor `wrapper` is
    part of v3's table anatomy, so they move to ./table-shell.slot-recipe.ts.

  - v2's `baseStyle` was a function of `{ borderColor, colorScheme }`. No call
    site ever passes `borderColor`, and `defaultProps.colorScheme` was
    `primary`, so the border always resolved to `primary.500`;
    `colorPalette.500` reproduces that.

Note most of this only takes effect for consumers rendering real Chakra table
parts — currently just
src/components/resource-sections/components/collection-information. The main
src/components/table renders `<Box as='thead'>` / `<Box as='tbody'>`, which
never consumed these slot styles under v2 either.
*/
export const tableSlotRecipe = defineSlotRecipe({
  slots: [
    'root',
    'header',
    'body',
    'row',
    'columnHeader',
    'cell',
    'footer',
    'caption',
  ],
  base: {
    header: {
      background: 'white',
    },
    columnHeader: {
      color: 'text.body',
      borderBottom: '0.25rem solid',
      borderColor: 'colorPalette.500',
      mb: 1,
      position: 'relative',
    },
    cell: {
      p: 4,
    },
    footer: {
      background: 'white',
      color: 'text.body',
      borderTop: '0.25rem solid',
      borderColor: 'colorPalette.500',
      mb: 1,
    },
    caption: {
      borderTop: '.0625rem solid',
      borderColor: 'colorPalette.200',
    },
  },
  variants: {
    size: {
      lg: {
        columnHeader: { p: 4 },
        cell: { p: 4 },
      },
    },
    /*
    v2 expressed this as `variant='striped'`. v3 splits Table's variants into a
    `variant` axis (line/outline) plus standalone booleans, so `striped`
    becomes a boolean and call sites move from `variant='striped'` to `striped`.
    */
    striped: {
      true: {
        row: {
          '&:nth-of-type(odd)': {
            'th, td': {
              borderBottomWidth: '1px',
              borderColor: 'white',
            },
            td: {
              background: 'white',
            },
          },
          '&:nth-of-type(even)': {
            'th, td': {
              borderBottomWidth: '1px',
              borderColor: 'page.alt',
            },
            td: {
              background: 'page.alt',
            },
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'lg',
    striped: true,
  },
});
