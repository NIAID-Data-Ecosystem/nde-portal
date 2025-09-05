import { defineTextStyles } from '@chakra-ui/react';

export const textStyles = defineTextStyles({
  h1: {
    value: {
      base: { fontSize: '5xl' },
      md: { fontSize: '6xl' },
    },
  },
  h2: {
    value: {
      base: { fontSize: '4xl' },
      md: { fontSize: '5xl' },
    },
  },
  h3: {
    value: {
      base: { fontSize: '3xl' },
      md: { fontSize: '4xl' },
    },
  },
  h4: {
    value: {
      base: { fontSize: '2xl' },
      md: { fontSize: '3xl' },
    },
  },
  h5: {
    value: {
      base: { fontSize: 'xl' },
      md: { fontSize: '2xl' },
    },
  },
  h6: { value: { fontSize: 'lg' } },
});
