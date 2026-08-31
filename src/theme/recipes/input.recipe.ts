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
      color: 'text.placeholder',
    },
  },
  variants: {
    size: {
      '2xs': {
        textStyle: 'xs',
        px: '2',
        '--input-height': 'sizes.7',
      },
      xs: {
        textStyle: 'xs',
        px: '2',
        '--input-height': 'sizes.8',
      },
      sm: {
        textStyle: 'sm',
        px: '2.5',
        '--input-height': 'sizes.9',
      },
      md: {
        textStyle: 'sm',
        px: '3',
        '--input-height': 'sizes.10',
      },
      lg: {
        textStyle: 'md',
        px: '4',
        '--input-height': 'sizes.11',
      },
      xl: {
        textStyle: 'md',
        px: '4.5',
        '--input-height': 'sizes.12',
      },
      '2xl': {
        textStyle: 'lg',
        px: '5',
        '--input-height': 'sizes.16',
      },
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
