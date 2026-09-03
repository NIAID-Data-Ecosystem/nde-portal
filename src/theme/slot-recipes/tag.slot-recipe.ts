import { defineSlotRecipe } from '@chakra-ui/react';
import { tagAnatomy } from '@chakra-ui/react/anatomy';

export const tagSlotRecipe = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: {
    label: { textUnderlineOffset: 'auto' },
    closeTrigger: {
      cursor: 'pointer',
      color: 'currentColor/80',
      _hover: {
        color: 'currentColor/100',
      },
    },
  },
  variants: {
    variant: {
      solid: {},
      subtle: {},
      outline: {},
      surface: {},
    },
    size: {
      md: {},
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
