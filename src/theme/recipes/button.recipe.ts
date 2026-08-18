import { defineRecipe } from '@chakra-ui/react';

/*
The `Link` wrapper in src/components/link wraps its children in a span classed
`child-string` or `child-node`, so a Button rendered `as={Link}` needs to reach
through that span to colour its text and icons.
*/
const CHILDREN = '.child-string, .child-node, .child-node p, svg';

/*
Ported from the v2 `Button` style config.

Two v2 behaviours are worth calling out, because they explain what is *absent*
here:

  - `solid` branched on a `colorMap` whose only entry was `negative`, and no
    call site ever passes `colorPalette='negative'`. Every live palette hit
    `if (!config) return {}`, so `solid` was always Chakra's stock solid. It
    stays absent here for the same reason.

  - `outline` and `ghost` had real entries for primary/secondary/gray. Those
    move into the `outline*` / `ghost*` semantic roles in
    ../semantic-tokens/colors.ts, so one static recipe covers every palette.

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
      outline: {
        borderColor: 'colorPalette.outlineBorder',
        color: 'colorPalette.outlineFg',
        bg: 'white',
        '&:hover, &:active': {
          borderColor: 'colorPalette.outlineHoverBg',
          bg: 'colorPalette.outlineHoverBg',
          color: 'white',
          [CHILDREN]: { color: 'white' },
          '&:disabled': {
            bg: 'white',
            color: 'colorPalette.outlineFg',
            borderColor: 'colorPalette.outlineBorder',
            [CHILDREN]: { color: 'colorPalette.outlineFg' },
          },
        },
        _visited: {
          color: 'colorPalette.outlineFg',
          [CHILDREN]: { color: 'colorPalette.outlineFg' },
          '&:hover': {
            color: 'white',
            [CHILDREN]: { color: 'white' },
          },
        },
      },
      ghost: {
        color: 'colorPalette.ghostFg',
        [CHILDREN]: { color: 'colorPalette.ghostFg' },
        '&:hover': {
          bg: 'colorPalette.ghostHoverBg',
        },
        _visited: {
          color: 'colorPalette.ghostFg',
          [CHILDREN]: { color: 'colorPalette.ghostFg' },
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
  /*
  v2 also set `colorPalette: 'primary'` in defaultProps. `colorPalette` is a
  style prop rather than a recipe variant, so it has no `defaultVariants`
  equivalent — it is applied globally in ../global-css.ts instead.
  */
  defaultVariants: {
    size: 'base',
    variant: 'solid',
  },
});
