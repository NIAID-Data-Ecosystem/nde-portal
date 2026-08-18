import { defineGlobalStyles } from '@chakra-ui/react';

/*
Global css styles. Ported from v2's `styles.global`, which was a function; v3
takes a plain object at the top level of `defineConfig` (beside `theme`, not
inside it).

The `'*'` block deep-merges into Chakra's own, which is substantial — the
`--ring-*`, filter and backdrop variables plus `fontFeatureSettings` all
survive alongside `listStyleType`.
*/
export const globalCss = defineGlobalStyles({
  '*': {
    listStyleType: 'none',
  },
  body: {
    fontFamily: 'body',
    color: 'text.body',
    fontSize: '16px',
    lineHeight: 'base',
  },
  /*
  v2 set `colorScheme: 'primary'` in the Button style config's `defaultProps`.
  `colorPalette` is a style prop rather than a recipe variant, so it cannot go
  in `defaultVariants` — scoping it here is the v3 equivalent, and mirrors how
  Chakra itself applies `colorPalette: 'gray'` to `html`.
  */
  '.chakra-button': {
    colorPalette: 'primary',
  },
});
