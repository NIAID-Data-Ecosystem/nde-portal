import { defineRecipe } from '@chakra-ui/react';

/*
Ported from the v2 `Input` style config. Two structural changes:

  - v3's Input is a single-part recipe, so the v2 `field` slot is flattened
    away.
  - v2's variants each called `styleInputBorder(colorPalette)` to pick a focus
    border. That per-palette value is now the `inputFocusBorder` semantic role
    in ../semantic-tokens/colors.ts, letting one static recipe cover every
    palette.

v2's `filled` variant is named `subtle` in v3. `defaultProps._placeholder` is
dropped: v2 merged defaultProps into the props bag handed to the style
functions, and Input's functions only destructured `colorPalette`, so it never
reached CSS (the real placeholder colour comes from `base` below).
*/
export const inputRecipe = defineRecipe({
  base: {
    fontWeight: 'light',
    _placeholder: {
      color: 'page.placeholder',
    },
  },
  variants: {
    size: {
      md: { h: 12 },
      lg: { h: 14 },
    },
    variant: {
      outline: {
        borderRadius: 'semi',
        _focus: {
          borderColor: 'colorPalette.inputFocusBorder',
          boxShadow: '{colors.colorPalette.inputFocusBorder} 0px 0px 0px 1px',
        },
        _focusWithin: {
          borderColor: 'colorPalette.inputFocusBorder',
          boxShadow: '{colors.colorPalette.inputFocusBorder} 0px 0px 0px 1px',
        },
      },
      subtle: {
        _focus: {
          borderColor: 'colorPalette.inputFocusBorder',
        },
        _focusWithin: {
          borderColor: 'colorPalette.inputFocusBorder',
        },
      },
      flushed: {
        _focus: {
          borderColor: 'colorPalette.inputFocusBorder',
          boxShadow: '0px 1px 0px 0px {colors.colorPalette.inputFocusBorder}',
        },
        _focusWithin: {
          borderColor: 'colorPalette.inputFocusBorder',
          boxShadow: '0px 1px 0px 0px {colors.colorPalette.inputFocusBorder}',
        },
      },
      // Custom variant, additive to Chakra's outline/subtle/flushed.
      shadow: {
        borderRadius: 'semi',
        border: '.0625rem solid',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'colorPalette.inputFocusBorder',
          boxShadow: 'sm',
        },
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'outline',
  },
});
