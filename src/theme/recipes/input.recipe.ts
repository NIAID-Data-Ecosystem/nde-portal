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
/**
 * The height each `size` resolves to, published on the input as the
 * `--input-height` CSS var below.
 *
 * Exported because this recipe is the only thing that declares that var — the
 * `textarea` recipe never does — while anything sitting *beside* an input sizes
 * itself off it: InputGroup derives its start/end element padding from it, and
 * `DropdownInput` uses it for the search icon and the trailing buttons. Read it
 * from here rather than keeping a second copy of the scale.
 */
export const INPUT_HEIGHTS = {
  '2xs': 'sizes.7',
  xs: 'sizes.8',
  sm: 'sizes.9',
  md: 'sizes.10',
  lg: 'sizes.11',
  xl: 'sizes.12',
  '2xl': 'sizes.16',
} as const;

/** The `size` an input falls back to, i.e. this recipe's `defaultVariants`. */
export const DEFAULT_INPUT_SIZE = 'sm';

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
        '--input-height': INPUT_HEIGHTS['2xs'],
      },
      xs: {
        textStyle: 'xs',
        px: '2',
        '--input-height': INPUT_HEIGHTS.xs,
      },
      sm: {
        textStyle: 'sm',
        px: '2.5',
        '--input-height': INPUT_HEIGHTS.sm,
      },
      md: {
        textStyle: 'sm',
        px: '3',
        '--input-height': INPUT_HEIGHTS.md,
      },
      lg: {
        textStyle: 'md',
        px: '4',
        '--input-height': INPUT_HEIGHTS.lg,
      },
      xl: {
        textStyle: 'md',
        px: '4.5',
        '--input-height': INPUT_HEIGHTS.xl,
      },
      '2xl': {
        textStyle: 'lg',
        px: '5',
        '--input-height': INPUT_HEIGHTS['2xl'],
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
    size: DEFAULT_INPUT_SIZE,
    variant: 'outline',
  },
});
