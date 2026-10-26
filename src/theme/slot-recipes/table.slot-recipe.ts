import { defineSlotRecipe } from '@chakra-ui/react';
import { tableAnatomy } from '@chakra-ui/react/anatomy';

/*
Table styles based on: https://designsystem.niaid.nih.gov/components/atoms

Ported from the v2 `Table` style config, minus two things:

  - v2 declared `parts: ['pagination', 'wrapper', 'caption']` but returned six
    keys. `parts` was inert in v2, and neither `pagination` nor `wrapper` is
    part of v3's table anatomy, so they move to ./table-shell.slot-recipe.ts.

  - v2's `baseStyle` was a function of `{ borderColor, colorPalette }`. No call
    site ever passes `borderColor`, and `defaultProps.colorPalette` was
    `primary`, so the border always resolved to `primary.500`;
    `colorPalette.500` reproduces that.

Note most of this only takes effect for consumers rendering real Chakra table
parts — currently just
src/components/resource-sections/components/collection-information. The main
src/components/table renders `<Box as='thead'>` / `<Box as='tbody'>`, which
never consumed these slot styles under v2 either.
*/

// `token(path, fallback)` compiles to `var(--palette-muted, var(--border))`, so
// a palette without the role (or no palette at all) still gets a colour.
const mutedBorder = 'token(colors.colorPalette.muted, colors.border)';
const fg = 'token(colors.colorPalette.fg, colors.fg)';

export const tableSlotRecipe = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  base: {
    cell: {
      p: 4,
    },
    columnHeader: {
      bg: 'white',
      color: fg,
      mb: 1,
      position: 'relative',
    },
    footer: {
      background: 'white',
      color: fg,
      mb: 1,
    },
    header: {
      background: 'white',
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
          '&:nth-of-type(odd) td': {
            bg: 'colorPalette.subtle/50',
          },
        },
      },
    },

    showColumnBorder: {
      true: {
        columnHeader: {
          '&:not(:last-of-type)': {
            borderInlineEndWidth: '1px',
            borderInlineEndColor: 'colorPalette.border/50',
          },
        },
        cell: {
          '&:not(:last-of-type)': {
            borderInlineEndWidth: '1px',
            borderInlineEndColor: mutedBorder,
          },
        },
      },
    },
    variant: {
      line: {
        columnHeader: {},
        row: {},
      },
      outline: {
        root: {
          boxShadow: `0 0 0 1px ${mutedBorder}`,
        },
        row: {
          borderColor: mutedBorder,
        },
        cell: {
          borderColor: mutedBorder,
        },

        columnHeader: {
          bg: 'white',
        },
      },
    },
  },

  defaultVariants: {
    size: 'lg',
    striped: true,
    variant: 'outline',
  },
});
