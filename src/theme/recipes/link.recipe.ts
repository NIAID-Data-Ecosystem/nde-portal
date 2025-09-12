import { defineRecipe } from '@chakra-ui/react';

const link = defineRecipe({
  base: {
    display: 'inline',
    color: 'link.default',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    _focus: {
      outlineColor: 'currentColor/50',
    },
    _visited: {
      color: 'link.visited',
      _icon: {
        color: 'link.visited',
      },
    },
  },

  variants: {
    variant: {
      // noline: no underline, no hover effect.
      noline: {
        color: 'inherit',
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
      },
      // underline: underline visible. on hover, underline fades out.
      underline: {
        color: 'link.default',
        textDecorationColor: 'currentColor',
        textUnderlineOffset: '4px',
        _hover: {
          textDecorationColor: 'transparent',
        },
      },
      // plain: no underline. on hover, underline with partial opacity.
      plain: {
        color: 'currentColor',
        textUnderlineOffset: '4px',
        _hover: {
          textDecorationColor: 'currentColor/80',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'underline',
  },
});

export default link;
