import { defineRecipe } from '@chakra-ui/react';

/*
Ported from the v2 `Badge` style config, which branched all three variants on
`colorPalette`. Most of that branching was unreachable: it covered `success`,
`warning`, `negative` and `info`, and no call site passes any of them —
`getColorScheme()` and the badge components hand it green/gray/red/blue/orange.
So only the niaid and gray branches survive, as the `badgeSolidBg` semantic
role in ../semantic-tokens/colors.ts.

Also dropped: v2 declared `fontWeight: 'semibold'` and `fontSize: '12px'` in
`defaultProps`. v2 merged defaultProps into the props bag handed to the style
*functions*, and Badge's functions only destructured `colorPalette`, so neither
value ever reached CSS. Reinstating them would be a visual change, not a port.
*/
export const badgeRecipe = defineRecipe({
  base: {
    lineHeight: 'short',
  },
  variants: {
    variant: {
      solid: {
        bg: 'colorPalette.badgeSolidBg',
        color: 'white',
      },
      subtle: {},
      outline: {
        color: 'colorPalette.fg',
        boxShadow: 'inset 0 0 0px 1px {colors.colorPalette.border}',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});
