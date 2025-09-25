import { defineRecipe } from '@chakra-ui/react';

const heading = defineRecipe({
  base: {
    color: 'text.heading',
    fontWeight: 'bold',
    lineHeight: { base: '1.33', md: '1.2' },
  },
  variants: {
    size: {
      h1: {
        textStyle: 'h1',
      },
      h2: {
        textStyle: 'h2',
      },
      h3: {
        textStyle: 'h3',
      },
      h4: {
        textStyle: 'h4',
      },
      h5: {
        textStyle: 'h5',
      },
      h6: {
        textStyle: 'h6',
      },
    },
  },
  defaultVariants: { as: 'h2' },
});

export default heading;
