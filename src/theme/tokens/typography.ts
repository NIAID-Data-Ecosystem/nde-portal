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
`base` does NOT exist in Chakra v3 (its scale is shorter/short/moderate/tall/
taller). The global body style and every Heading size reference
`lineHeight: 'base'`, so without this token that resolves to the literal string
"base", which browsers discard — silently falling back to v3's `html`
line-height of 1.5. `short` overrides v3's 1.375 back to the v2 value.
*/
export const lineHeights = defineTokens.lineHeights({
  // base: { value: 2 },
  // short: { value: 1.5 },
});
