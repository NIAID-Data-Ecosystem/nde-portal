import { defineTokens } from '@chakra-ui/react';

/*
NIAID styleguide typography
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/typography

USWDS Typesetting guidelines:
https://designsystem.digital.gov/design-tokens/typesetting/overview/
*/

export const fonts = defineTokens.fonts({
  heading: { value: 'var(--font-public-sans)' },
  body: { value: 'var(--font-public-sans)' },
});

/*
These override Chakra's defaults (xs 0.75rem, sm 0.875rem), exactly as the v2
theme did. Because v3's own recipes reach font sizes through `textStyles` —
which hardcode a matching `lineHeight` in rem — the override propagates into
every built-in that uses `textStyle: 'xs' | 'sm'`, giving a slightly larger
glyph in an unchanged line box. That is why the recipes in ../recipes set
`fontSize` + `lineHeight` explicitly instead of going through `textStyle`.
*/
export const fontSizes = defineTokens.fontSizes({
  // xs: { value: '0.875rem' },
  // sm: { value: '0.937rem' },
});

/*
The v2 NIAID overrides (`base` 2, `short` 1.5) are deliberately off, so v3's
stock line heights apply app-wide.

v3's scale is shorter/short/moderate/tall/taller only. There is no `base`
(v2's stock `base` of 1.5 is v3's `moderate`) and no `none` (use `1`). An
unknown name is emitted as a literal string that browsers discard, so the
element silently inherits its parent's line-height instead.
*/
export const lineHeights = defineTokens.lineHeights({
  // base: { value: 2 },
  // short: { value: 1.5 },
});
