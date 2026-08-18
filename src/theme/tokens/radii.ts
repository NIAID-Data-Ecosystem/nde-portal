import { defineTokens } from '@chakra-ui/react';

/*
`semi` is additive — not a Chakra name, so it simply joins the scale and keeps
resolving everywhere it is referenced.

`full` intentionally overrides Chakra's `9999px`, matching the v2 theme. Note
this also reshapes v3 built-ins that use `rounded='full'` (Avatar, Switch) from
a pill into a 16px radius.
*/
export const radii = defineTokens.radii({
  none: { value: '0' },
  semi: { value: '0.3125rem' },
  full: { value: '1rem' },
});
