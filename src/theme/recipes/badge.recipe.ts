import { defineRecipe } from '@chakra-ui/react';

export const badgeRecipe = defineRecipe({
  base: {
    rounded: 'full',
  },
  variants: {
    size: {
      md: {},
    },
    variant: {
      solid: {},
      subtle: {},
      outline: {},
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'subtle',
  },
});
