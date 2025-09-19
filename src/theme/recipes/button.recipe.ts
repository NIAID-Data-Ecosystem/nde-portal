import { defineRecipe } from '@chakra-ui/react';

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
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'solid',
  },
});

export default button;
