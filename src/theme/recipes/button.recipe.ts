import { defineRecipe } from '@chakra-ui/react';

/*
Ported from the v2 `Button` style config.

Three v2 behaviours are worth calling out, because they explain what is *absent*
here:

  - `solid` branched on a `colorMap` whose only entry was `negative`, and no
    call site ever passes `colorPalette='negative'`. Every live palette hit
    `if (!config) return {}`, so `solid` was always Chakra's stock solid. It
    stays absent here for the same reason.

  - `outline` and `ghost` had real entries for primary/secondary/gray. Those
    move into the `outline*` / `ghost*` semantic roles in
    ../semantic-tokens/colors.ts, so one static recipe covers every palette.

  - each variant repeated its `color` on a `.child-string, .child-node,
    .child-node p, svg` selector, to reach through the wrapper span that
    src/components/link used to add. That wrapper is gone, and an `svg` child
    already paints itself with `currentColor`, so the button's own `color`
    covers text and icons alike.

Hover/active use raw `&:hover` / `&:active` rather than Chakra's `_hover` /
`_active`, matching the v2 recipe's bare `:hover`. v3's `_hover` wraps the rule
in `@media (hover: hover)` and excludes `:disabled`, which would stop these
firing on touch devices.
*/
export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: 'semi',
    fontWeight: 'normal',
    fontFamily: 'body',
  },
  variants: {
    size: {
      sm: {
        fontSize: 'sm',
        px: 3,
        py: 1.5,
      },
      md: {
        fontSize: 'md',
        px: 8,
        py: 4,
      },
      // Custom size, additive to Chakra's 2xs-2xl scale. The app default.
      base: {
        height: 'unset',
        px: 8,
        py: 4,
      },
    },
    variant: {
      solid: {},
      outline: {
        borderColor: 'colorPalette.outlineBorder',
        color: 'colorPalette.outlineFg',
        bg: 'white',
        '&:hover, &:active': {
          borderColor: 'colorPalette.outlineHoverBg',
          bg: 'colorPalette.outlineHoverBg',
          color: 'white',
          '&:disabled': {
            bg: 'white',
            color: 'colorPalette.outlineFg',
            borderColor: 'colorPalette.outlineBorder',
          },
        },
        _visited: {
          color: 'colorPalette.outlineFg',
          '&:hover': {
            color: 'white',
          },
        },
      },
      ghost: {
        color: 'colorPalette.ghostFg',
        '&:hover': {
          bg: 'colorPalette.ghostHoverBg',
        },
        _visited: {
          color: 'colorPalette.ghostFg',
        },
      },
      link: {
        textDecoration: 'underline',
        '&:hover': {
          textDecoration: 'none',
        },
      },
      unstyled: {
        background: 'transparent',
        color: 'inherit',
        '&:hover': {
          background: 'transparent',
          color: 'inherit',
        },
      },
    },
  },

  defaultVariants: {
    size: 'base',
    variant: 'solid',
  },
});
