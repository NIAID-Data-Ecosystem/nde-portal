import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: 'semi',
    fontWeight: 'medium',
    fontFamily: 'body',
    height: 'unset',
    colorPalette: 'primary',
  },
  variants: {
    status: {
      info: { colorPalette: 'blue' },
      warning: { colorPalette: 'orange' },
      success: { colorPalette: 'green' },
      error: { colorPalette: 'red' },
      neutral: { colorPalette: 'gray' },
    },

    size: {
      sm: {
        // fontSize: 'sm',
        // px: 3,
        // py: 1.5,
      },
      md: {
        // fontSize: 'md',
        // px: 8,
        // py: 4,
      },
    },
    variant: {
      solid: {},
      // outline: {
      //   borderColor: 'colorPalette.outlineBorder',
      //   color: 'colorPalette.outlineFg',
      //   bg: 'white',
      //   '&:hover, &:active': {
      //     borderColor: 'colorPalette.outlineHoverBg',
      //     bg: 'colorPalette.outlineHoverBg',
      //     color: 'white',
      //     '&:disabled': {
      //       bg: 'white',
      //       color: 'colorPalette.outlineFg',
      //       borderColor: 'colorPalette.outlineBorder',
      //     },
      //   },
      //   _visited: {
      //     color: 'colorPalette.outlineFg',
      //     '&:hover': {
      //       color: 'white',
      //     },
      //   },
      // },
      // ghost: {
      //   color: 'colorPalette.ghostFg',
      //   '&:hover': {
      //     bg: 'colorPalette.ghostHoverBg',
      //   },
      //   _visited: {
      //     color: 'colorPalette.ghostFg',
      //   },
      // },
      link: {
        color: 'colorPalette.ghostFg',
        textDecoration: 'underline',
        '&:hover': {
          textDecoration: 'none',
        },
      },
      unstyled: {
        height: 'unset',
        borderRadius: 'none',
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
    size: 'md',
    variant: 'solid',
  },
});
