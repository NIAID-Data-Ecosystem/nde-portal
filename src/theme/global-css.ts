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
    lineHeight: '1.5',
  },
  // sets default color palette for components if not specified
  // https://chakra-ui.com/guides/theming-change-default-color-palette
  html: {
    colorPalette: 'none',
  },
  body: {
    fontFamily: 'body',
    color: 'text.body',
  },
  // [chakra-todo] unsure if needed, but keeping for now to match v2's `styles.global`
  // strong: {
  //   lineHeight: 'inherit',
  // },
  // span: {
  //   color: 'inherit',
  //   lineHeight: 'inherit',
  // },
  // ul: { listStyle: 'none' },
});
