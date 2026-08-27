import { defineSlotRecipe } from '@chakra-ui/react';
import { switchAnatomy } from '@chakra-ui/react/anatomy';

export const switchSlotRecipe = defineSlotRecipe({
  slots: switchAnatomy.keys(),
  base: {
    label: {
      color: 'gray.800',
    },
  },
});
