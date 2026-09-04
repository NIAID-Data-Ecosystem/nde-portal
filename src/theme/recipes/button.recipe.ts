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
    /*
    Modifier axis, independent of `variant`. Composes with any variant/status:
    `<Button variant='ghost' underline>`. NOT named `type` — recipe variant keys
    are stripped from the DOM by splitVariantProps, so a `type` variant would
    swallow the native `<button type>` attribute.
    */
    underline: {
      true: {
        textDecoration: 'underline',
        _hover: {
          textDecoration: 'none',
        },
      },
    },
    size: {
      xs: {
        textStyle: 'sm',
        gap: 1.5,
        _icon: {
          width: '3.5',
          height: '3.5',
        },
      },

      sm: {
        _icon: {
          width: '3.5',
          height: '3.5',
        },
      },

      md: {
        _icon: {
          width: '4',
          height: '4',
        },
      },
    },
    variant: {
      solid: {},
      /*
      Text only — the rest of v3's `outline` variant (border width/colour, hover
      background) is inherited from Chakra's recipe. `outlineFg` resolves to
      `.700`, i.e. what `colorPalette.fg` already gave, for every palette but
      gray, which needs `.900`. The indirection exists because a static recipe
      cannot branch on `colorPalette`. See ../semantic-tokens/colors.ts.
      */
      outline: {
        color: 'colorPalette.outlineFg',
        borderColor: 'colorPalette.outlineBorder',
      },

      unstyled: {
        px: 0,
        height: 'unset',
        borderRadius: 'none',
        background: 'transparent',
        color: 'colorPalette.outlineFg',

        '&:hover': {
          background: 'transparent',
          color: 'inherit',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
