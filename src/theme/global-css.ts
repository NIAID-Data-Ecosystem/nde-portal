import { defineGlobalStyles } from '@chakra-ui/react';

/*
Global css styles. Ported from v2's `styles.global`, which was a function; v3
takes a plain object at the top level of `defineConfig` (beside `theme`, not
inside it).

The `'*'` block deep-merges into Chakra's own, which is substantial — the
`--ring-*`, filter and backdrop variables plus `fontFeatureSettings` all
survive alongside anything added here.

Do NOT reset `listStyleType` here. v2 needed it, v3 does not: preflight already
ships `ol, ul { list-style: none }` in `@layer reset`. That targets the list
element only, so the `li` inherits and any override on the list wins. Pinning
it on `'*'` instead matches the `li` directly, and a direct declaration always
beats an inherited one — which makes `listStyleType` on `List.Root`
(and List's own `variant='marker'`) silently do nothing.
*/
export const globalCss = defineGlobalStyles({
  '*': {},
  // sets default color palette for components if not specified
  // https://chakra-ui.com/guides/theming-change-default-color-palette
  html: {
    colorPalette: 'none',
  },
  body: {
    fontFamily: 'body',
    color: 'text.body',
  },
  /* Chakra's own rule here is `fg.muted/80`. Overriding the same key — rather
     than a per-recipe `_placeholder` — is what makes `text.placeholder` the
     default everywhere a placeholder can appear: input, textarea, and the
     `data-placeholder` elements Select/Combobox render instead of real
     placeholder text. */
  '*::placeholder, *[data-placeholder]': {
    color: 'text.placeholder',
  },
  // [chakra-todo] unsure if needed, but keeping for now to match v2's `styles.global`
  // strong: {
  //   lineHeight: 'inherit',
  // },
  // span: {
  //   color: 'inherit',
  //   lineHeight: 'inherit',
  // },
});
