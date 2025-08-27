import { defineRecipe } from '@chakra-ui/react';

const button = defineRecipe({
  base: {
    borderRadius: 'semi',
    fontWeight: 'normal',
    fontFamily: 'body',
  },
  variants: {
    variant: {
      solid: { _hover: { bg: 'colorPalette.600' } },
      outline: {
        borderColor: 'colorPalette.500',
        color: 'colorPalette.500',
        _hover: { bg: 'colorPalette.600', color: 'white' },
      },
      link: {
        textDecoration: 'underline',

        _hover: {
          textDecoration: 'none',
        },
      },
    },
    size: {
      sm: {
        fontSize: 'sm',
        px: 3, // <-- these values are tokens from the design system
        py: 1.5, // <-- these values are tokens from the design system
      },
      md: {
        fontSize: 'md',
        px: 8, // <-- these values are tokens from the design system
        py: 4, // <-- these values are tokens from the design system
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'solid',
  },
});

export default button;
