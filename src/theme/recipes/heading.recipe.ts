import { defineRecipe } from '@chakra-ui/react';

const heading = defineRecipe({
  base: {
    color: 'text.heading',
    fontWeight: 'bold',
    lineHeight: 'base',
  },
  variants: {
    as: {
      h1: {
        fontWeight: 800,
        base: { fontSize: '5xl' },
        md: { fontSize: '6xl' },
      },
      h2: {
        base: { fontSize: '4xl' },
        md: { fontSize: '5xl' },
      },
      h3: {
        base: { fontSize: '3xl' },
        md: { fontSize: '4xl' },
      },
      h4: {
        base: { fontSize: '2xl' },
        md: { fontSize: '3xl' },
      },
      h5: {
        base: { fontSize: 'xl' },
        md: { fontSize: '2xl' },
      },
      h6: { fontSize: 'lg' },
    },
  },
  defaultVariants: { as: 'h2' },
});

export default heading;
