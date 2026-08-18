/*
Pinned to Chakra **v2**'s breakpoints, which the v2 theme inherited.

Most of the scale is unchanged between versions, but `lg` moved: v2 used 62em
(992px) where v3 uses 1024px. The app has ~144 responsive style arrays and ~117
explicit `lg:` references, so taking v3's value would shift layouts across the
site at that one width.

Chakra v3 wants plain px/em strings here (not `{ value: ... }` token shape) —
`theme.breakpoints` sits beside `theme.tokens`, not inside it.
*/
export const breakpoints = {
  base: '0em',
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};
