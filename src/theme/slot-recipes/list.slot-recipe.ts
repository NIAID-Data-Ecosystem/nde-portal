import { defineSlotRecipe } from '@chakra-ui/react';
import { listAnatomy } from '@chakra-ui/react/anatomy';

/*
Lists render without a marker unless a call site asks for one.

Chakra defaults List to `variant='marker'`, whose root sets `listStyle: revert`
— i.e. roll back to the UA value, `disc`. That lands in `@layer recipes`, the
last layer in `@layer reset, base, tokens, recipes`, so it outranks both
preflight's `ol, ul { list-style: none }` and anything in `globalCss`. No global
rule can turn it off; flipping the default variant is the only lever.

v2 papered over this with `* { list-style-type: none }` in `styles.global`. That
worked, but by matching every `li` directly it also blocked the `ul` from ever
passing a marker down by inheritance, so `listStyleType` on `List.Root` was
silently dead. Don't reintroduce it — see the note in ../global-css.ts.

To opt a list in: `variant='marker'` for the UA default, or `listStyleType`
(a style prop, unlayered, so it beats the recipe either way). Markers also need
`paddingStart`, since preflight's `* { padding: 0 }` strips the UA indent and
`list-style-position` defaults to `outside`.
*/
export const listSlotRecipe = defineSlotRecipe({
  slots: listAnatomy.keys(),
  variants: {
    variant: {
      /* Chakra's `plain` also swaps the item to `inline-flex`, which shrink-wraps
         it. Keep the `display: list-item` the recipe's own `base` sets, so
         changing the default variant costs a marker and nothing else — the ~35
         existing List.Root call sites, none of which pass `variant`, keep their
         current layout. */
      plain: {
        item: { display: 'list-item' },
      },
    },
  },
  defaultVariants: {
    variant: 'plain',
  },
});
