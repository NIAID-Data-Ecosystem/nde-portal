import { defineSlotRecipe } from '@chakra-ui/react';

/*
Ported from the v2 `Card` multi-part style config. The v2 `container` slot is
called `root` in v3's card anatomy; the rest map across unchanged.

Chakra v3's card base drives all its padding through a `--card-padding` custom
property, which will compete with the explicit `pt`/`pb`/`mb` rules below.
Those are kept because they are more specific and they are what the app's
layouts are built around.
*/
export const cardSlotRecipe = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      bg: 'white',
      boxShadow: 'base',
      borderRadius: 'semi',
      overflow: 'hidden',
    },
    header: {
      pb: [2, 4],
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      pt: 0,
      '>*': {
        my: 4,
      },
      _notLast: {
        pb: 0,
      },
      _last: {
        '>*': {
          _last: { mb: 0 },
        },
      },
    },
    footer: {
      display: 'flex',
    },
  },
  variants: {
    variant: {
      niaid: {
        root: {},
        header: { bg: 'niaid.500', color: 'white' },
        footer: { bg: 'page.alt' },
      },
    },
  },
});
