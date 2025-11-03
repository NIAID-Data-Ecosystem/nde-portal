import { defineRecipe } from '@chakra-ui/react';

// [NOTE]: These are the default sizes set in the theme by Chakra UI reference.
// https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/theme/recipes/button.ts
// Redefining these can have unintended consequences, since other elements like inputs match these sizings.

const button = defineRecipe({
  base: {
    borderRadius: 'semi',
    fontWeight: 'medium',
    fontFamily: 'body',
  },
  compoundVariants: [
    {
      variant: 'link',
      colorPalette: 'gray',
      css: {
        color: 'colorPalette.900',
      },
    },
    {
      variant: 'outline',
      colorPalette: 'gray',
      css: {
        color: 'gray.900',
        borderColor: 'gray.200',
        _hover: { bg: 'colorPalette.900' },
      },
    },
  ],
  variants: {
    variant: {
      link: {
        height: 'unset',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        color: 'colorPalette.500',
        _hover: {
          color: 'colorPalette.600',
          textDecoration: 'none',
        },
      },
      solid: { _hover: { bg: 'colorPalette.600' } },
      outline: {
        borderColor: 'colorPalette.500',
        color: 'colorPalette.500',
        _hover: { bg: 'colorPalette.600', color: 'white' },
      },
    },
    size: {
      '2xs': {
        gap: 2,
        fontSize: '12px',
        lineHeight: 'shorter',
        // _icon: {
        //   width: '3',
        //   height: '3',
        // },
      },
      xs: {
        gap: 2,
        _icon: {
          width: '3',
          height: '3',
        },
      },
      sm: {
        gap: 2,
        // fontSize: 'sm',
        // height: 'unset',
        px: 3, // <-- these values are tokens from the design system
        py: 1.5, // <-- these values are tokens from the design system
      },
      md: {
        // px: 3, // <-- these values are tokens from the design system
        // py: 1.5, // <-- these values are tokens from the design system
        _icon: {
          width: '4',
          height: '4',
        },
      },
      lg: {},
      xl: {},
      '2xl': {},
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'solid',
  },
});

export default button;
