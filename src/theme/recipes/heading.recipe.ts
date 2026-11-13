import { defineRecipe } from '@chakra-ui/react';

/*
Ported from the v2 `Heading` style config, which defined h1-h6 plus overrides
for `sm`/`xs` and inherited the rest of the scale from Chakra v2.

The 4xl-md sizes below are those inherited v2 values, reproduced verbatim. They
have to be explicit now because Chakra v3 rebuilt its heading scale on top of
`textStyles`, where `xl` is roughly 1.25rem — an order of magnitude smaller
than v2's `xl` (`['3xl', null, '4xl']`). Since `xl` is also the default size and
69 of the app's 90 `<Heading>`s render without an explicit `size`, taking v3's
scale would visibly shrink almost every heading in the app.
*/
export const headingRecipe = defineRecipe({
  base: {
    color: 'text.heading',
    fontFamily: 'heading',
    fontWeight: 'bold',
  },
  variants: {
    size: {
      // Inherited from Chakra v2 — reproduced so the default size is unchanged.
      '4xl': { fontSize: ['6xl', null, '7xl'], lineHeight: 1 },
      '3xl': { fontSize: ['5xl', null, '6xl'], lineHeight: 1 },
      '2xl': { fontSize: ['4xl', null, '5xl'], lineHeight: [1.2, null, 1] },
      xl: { fontSize: ['3xl', null, '4xl'], lineHeight: [1.33, null, 1.2] },
      lg: { fontSize: ['2xl', null, '3xl'], lineHeight: [1.33, null, 1.2] },
      md: { fontSize: 'xl', lineHeight: 1.2 },

      // Defined by the NIAID theme.
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
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});
