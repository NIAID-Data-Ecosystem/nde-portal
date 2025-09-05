import { defineRecipe } from '@chakra-ui/react';

const link = defineRecipe({
  base: {
    color: 'link.default',
    gap: '1',
    _focus: {
      outlineColor: 'currentColor/50',
    },

    _visited: {
      color: 'link.visited',
      '& .chakra-icon': {
        color: 'link.visited',
      },
    },
  },

  variants: {
    variant: {
      'no-line': {
        color: 'inherit',
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
      },
      underline: {
        color: 'link.default',
        textDecorationColor: 'currentColor',
        textUnderlineOffset: '4px',
        _hover: {
          textDecorationColor: 'transparent',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'underline',
  },
});

export default link;
