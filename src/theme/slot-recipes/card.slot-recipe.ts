import { defineSlotRecipe } from '@chakra-ui/react';
import { cardAnatomy } from '@chakra-ui/react/anatomy';

/*
Ported from the v2 `Card` multi-part style config. The v2 `container` slot is
called `root` in v3's card anatomy; the rest map across unchanged.

Chakra v3's card base drives all its padding through a `--card-padding` custom
property, which will compete with the explicit `pt`/`pb`/`mb` rules below.
Those are kept because they are more specific and they are what the app's
layouts are built around.
*/
// [TO DO]: See if custom styles (commented) from previous implementation are necessary

export const cardSlotRecipe = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    root: {
      overflow: 'hidden',
    },
    header: {},
    body: { gap: 'var(--card-padding)' },

    description: {
      lineHeight: 'short',
      color: 'text.body',
    },
    footer: {},
  },
  variants: {
    size: {
      xs: {
        root: {
          '--card-padding': 'spacing.2',
        },
        title: {
          textStyle: 'sm',
        },
      },
    },
    variant: {
      niaid: {
        root: {},
        header: { bg: 'niaid.500', color: 'white' },
        footer: { bg: 'bg.alt' },
      },
      outline: {
        root: {
          borderColor: 'gray.100',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
});
