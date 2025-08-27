import { defineRecipe } from '@chakra-ui/react';

const badge = defineRecipe({
  base: {
    // fontWeight: 'semibold',
  },
  variants: {
    variant: {
      solid: {},
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

export default badge;
