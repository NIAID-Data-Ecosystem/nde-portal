import { defineSlotRecipe } from '@chakra-ui/react';
import { tagAnatomy } from '@chakra-ui/react/anatomy';

/*
Tag styles based on: https://designsystem.niaid.nih.gov/components/atoms

Ported from the v2 `Tag` style config, which was in an odd state: it had been
part-written against a Chakra v3 alpha and then left in the v2 theme. Under v2
most of it did nothing, so most of it is deliberately *not* carried over:

  - It declared v2's `container`/`label`/`closeButton` slots. v3's anatomy is
    root/label/closeTrigger/startElement/endElement, so the names are remapped.
  - It set `--tag-font-size`, `--tag-min-height`, `--tag-padding-inline` and
    `--tag-shadow`. No Chakra version reads those (v3's own recipe uses
    `--tag-avatar-size` / `--tag-element-size` / `--tag-element-offset`), so
    they emitted nothing and are dropped.
  - `focusVisibleRing`, `focusRingWidth`, `lineClamp` and `borderRadius: 'l1'`
    are v3-only APIs that produced no CSS under v2. Dropped rather than newly
    enabled, which would be a visual change.
  - The `subtle` variant was a function reading `theme.colors[colorPalette][200]`
    to build a shadow, but the default variant is `solid`, so it never ran.

What remains is what actually rendered: the `semi` radius, the label line
height, close-trigger sizing, and the per-size gap/padding/icon dimensions.
*/
// [chakra-todo]: adjust based on needs
export const tagSlotRecipe = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: {
    // root: {
    //   borderRadius: 'semi',
    //   display: 'inline-flex',
    //   alignItems: 'center',
    //   verticalAlign: 'top',
    //   lineHeight: '1.2',
    //   maxWidth: '100%',
    //   outline: 0,
    //   userSelect: 'none',
    // },
    // label: {
    //   lineHeight: '1rem',
    // },
    closeTrigger: {
      cursor: 'pointer',
      color: 'currentColor/80',
      _hover: {
        color: 'currentColor/100',
      },
    },
    // closeTrigger: {
    //   fontSize: 'lg',
    //   w: '5',
    //   h: '5',
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   margin: 0,
    //   outline: '0',
    //   color: 'currentColor',
    //   svg: {
    //     width: '1em',
    //     height: '1em',
    //   },
    // },
  },
  variants: {
    variant: {
      solid: {},
      subtle: {},
      outline: {},
      surface: {},
    },
    size: {
      sm: {
        root: {
          gap: '1',
          py: 0.5,
          svg: { width: '3', height: '3' },
        },
      },
      md: {
        root: {
          gap: '1',
          py: 1,
          svg: { width: '3', height: '3' },
        },
      },
      lg: {
        root: {
          gap: '1.5',
          py: 1,
          svg: { width: '4', height: '4' },
        },
      },
      xl: {
        root: {
          gap: '1.5',
          svg: { width: '4', height: '4' },
        },
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
