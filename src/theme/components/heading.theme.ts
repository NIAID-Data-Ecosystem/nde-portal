import { SystemStyleObject } from '@chakra-ui/react';

const sizes: Record<string, SystemStyleObject> = {
  h1: {
    fontSize: ['5xl', null, '6xl'],
    lineHeight: 'base',
    fontWeight: 800,
  },
  h2: {
    fontSize: ['4xl', null, '5xl'],
    lineHeight: 'base',
  },
  h3: {
    fontSize: ['3xl', null, '4xl'],
    lineHeight: ['base', null, 'base'],
  },
  h4: {
    fontSize: ['2xl', null, '3xl'],
    lineHeight: ['base', null, 'base'],
  },
  h5: {
    fontSize: ['xl', null, '2xl'],
    lineHeight: ['base', null, 'base'],
  },
  h6: { fontSize: 'lg', lineHeight: 'base' },
  sm: { fontSize: 'md', lineHeight: 'base' },
  xs: { fontSize: 'sm', lineHeight: 'base' },
};

export const Heading = {
  baseStyle: {
    color: 'text.heading',
    fontWeight: 'bold',
  },
  sizes,
};
