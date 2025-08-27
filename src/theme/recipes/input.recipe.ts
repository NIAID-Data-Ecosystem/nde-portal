import { defineRecipe } from '@chakra-ui/react';

const input = defineRecipe({
  base: {
    _placeholder: {
      color: 'page.placeholder',
    },
    borderRadius: 'semi',
  },
});

export default input;
