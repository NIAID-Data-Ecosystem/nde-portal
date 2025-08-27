import { defineSlotRecipe } from '@chakra-ui/react';
import { tagAnatomy } from '@chakra-ui/react/anatomy';

const tag = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: {
    closeTrigger: {
      cursor: 'pointer',
      color: 'currentColor/80',
      _hover: {
        color: 'currentColor/100',
      },
    },
  },
});

export default tag;
