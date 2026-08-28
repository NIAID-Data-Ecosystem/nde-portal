import { defineRecipe } from '@chakra-ui/react';

// chakra-todo: adjust based on needs. Leveraging underline instead of border-bottom to avoid having to wrap children in a span.

export const linkRecipe = defineRecipe({
  base: {
    display: 'inline',
    color: 'link',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    _focus: {
      outlineColor: 'currentColor/50',
    },
    _visited: {
      color: 'link.visited',
      _icon: {
        color: 'link.visited',
      },
    },
  },

  variants: {
    variant: {
      // unstyled: no underline, no hover effect.
      unstyled: {
        color: 'inherit',
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
        _visited: {
          color: 'inherit',
        },
      },
      // underline: underline visible. on hover, underline fades out.
      underline: {
        color: 'link',
        textDecorationColor: 'currentColor',
        textUnderlineOffset: '4px',
        _hover: {
          textDecorationColor: 'transparent',
        },
      },

      // plain: no underline. on hover: underline with partial opacity.
      plain: {
        color: 'currentColor',
        textUnderlineOffset: '4px',
        _hover: {
          textDecorationColor: 'currentColor/90',
        },
      },

      // nav: navigation link style
      nav: {
        color: '{colors.white}',
        textDecoration: 'none',
        '&[data-active]': {
          textDecorationLine: 'underline',
          textDecorationThickness: '2px',
          textUnderlineOffset: '8px',
        },
        _hover: {
          textDecorationColor: 'currentColor/80',
          bg: 'whiteAlpha.300',
          color: '{colors.white}',
        },
        _visited: {
          color: '{colors.white}',
          _hover: {
            color: '{colors.white}',
          },
        },
      },
    },
  },

  defaultVariants: {
    variant: 'underline',
  },
});

/*
NIAID Digital Policies specify a border-bottom underline for links rather than
`text-decoration`, so the underline has to sit on the text itself — an anchor
also containing the "opens in new tab" icon would otherwise underline that icon
too. src/components/link wraps children in a span classed `child-string` (plain
text) or `child-node` (elements), and the selectors below target it.

Keep these in sync with that wrapper; the class names are part of its contract
and src/components/metadata/components/buttons.tsx overrides them from outside.
*/
// const CHILD = '.child-string, .child-node, .child-node p';
// const UNDERLINED = '.child-string, .child-node p';
// const CHILD_SVG = '.child-string, .child-node, .child-node p, svg';

// const HAIRLINE = '0.0625rem solid';

/*
Ported from the v2 `Link` style config.

The v2 version read arbitrary style props (`props.color`, `props.borderBottom`,
`props._hover.color`, `props._visited.color`) to compute these values. v3
recipes only receive variant/size, so those reads become the fixed `link`
/ `link.visited` / hairline defaults they fell back to in practice — no current
call site passed them. `color=` still works as a plain style prop; what is gone
is feeding a call-site colour into a *descendant* selector.

Hover uses raw `&:hover` rather than `_hover` to match the v2 recipe's bare
`:hover`, which fires on touch devices too (v3's `_hover` is wrapped in
`@media (hover: hover)`).
*/
// export const linkRecipe = defineRecipe({
//   base: {
//     // Chakra v3's Link base is `inline-flex`; the border-bottom scheme needs
//     // the text to sit in normal inline flow.
//     display: 'inline',
//     color: 'link',
//     textDecoration: 'none',
//     svg: {
//       color: 'currentColor',
//     },
//     [CHILD]: {
//       width: '100%',
//       display: 'inline',
//       alignItems: 'baseline',
//       color: 'inherit',
//     },
//     [UNDERLINED]: {
//       borderBottom: HAIRLINE,
//     },
//     '&:hover': {
//       color: 'link',
//       textDecoration: 'none',
//       [CHILD]: {
//         borderBottomColor: 'transparent',
//         color: 'inherit',
//       },
//     },
//     _visited: {
//       color: 'link.visited',
//       [CHILD_SVG]: {
//         color: 'link.visited',
//       },
//       '&:hover': {
//         borderBottom: 'transparent',
//         [CHILD]: {
//           borderBottomColor: 'transparent',
//         },
//       },
//     },
//   },
//   variants: {
//     variant: {
//       /*
//       src/components/link types `variant?: 'base' | 'unstyled' | 'ghost'`, but
//       the v2 config only ever defined ghost and unstyled — `base` silently
//       resolved to the base style alone. Declaring it empty makes that the
//       explicit, type-checked default.
//       */
//       base: {},
//       ghost: {
//         borderBottomColor: 'transparent',
//         [CHILD]: {
//           color: 'inherit',
//           borderBottomColor: 'transparent',
//         },
//         [UNDERLINED]: {
//           borderBottomColor: 'transparent',
//         },
//         '&:hover': {
//           borderBottom: HAIRLINE,
//           borderBottomColor: 'transparent',
//           [CHILD]: {
//             borderBottom: HAIRLINE,
//             borderBottomColor: 'link',
//           },
//         },
//         _visited: {
//           borderBottom: HAIRLINE,
//           borderBottomColor: 'transparent',
//           [CHILD_SVG]: {
//             borderBottom: HAIRLINE,
//             borderBottomColor: 'transparent',
//           },
//           '&:hover': {
//             borderBottomColor: 'link.visited',
//             [CHILD]: {
//               borderBottomColor: 'link.visited',
//             },
//           },
//         },
//       },
//       unstyled: {
//         [UNDERLINED]: {
//           borderBottomColor: 'transparent',
//         },
//         '&:hover': {
//           color: 'link',
//           [CHILD]: {
//             borderBottomColor: 'transparent',
//             color: 'inherit',
//           },
//         },
//         _visited: {
//           color: 'link.visited',
//           [CHILD_SVG]: {
//             color: 'link.visited',
//           },
//           '&:hover': {
//             borderBottom: 'transparent',
//             color: 'link.visited',
//             [CHILD_SVG]: {
//               borderBottomColor: 'transparent',
//               color: 'inherit',
//             },
//           },
//         },
//       },
//     },
//   },
//   defaultVariants: {
//     variant: 'base',
//   },
// });
