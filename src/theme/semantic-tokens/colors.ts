import { defineSemanticTokens } from '@chakra-ui/react';

/*
Chakra v3 drives every palette-aware component through the `colorPalette` prop,
which resolves the semantic roles below into `--chakra-colors-color-palette-*`
custom properties. Two jobs here:

  1. The eight standard roles (contrast/fg/subtle/muted/emphasized/solid/
     focusRing/border). Chakra ships these for its own palettes but not for
     ours, so `colorPalette='primary'` would otherwise render colourless in any
     untouched built-in (Select, Menu, Alert, Checkbox...).

  2. Custom roles (`outline*`, `ghost*`, `badgeSolidBg`) that let a *static*
     recipe reproduce the v2 theme's per-`colorPalette` branching. v2 styled
     these with functions of the props bag, which v3 recipes do not receive; by
     moving the per-palette differences into tokens, one static recipe covers
     every palette. See ../recipes/button.recipe.ts and badge.recipe.ts.
*/

/** The eight roles Chakra expects, derived from a 50-900 scale. */
const standard = (name: string) => ({
  contrast: { value: '{colors.white}' },
  fg: { value: `{colors.${name}.700}` },
  subtle: { value: `{colors.${name}.100}` },
  muted: { value: `{colors.${name}.200}` },
  emphasized: { value: `{colors.${name}.300}` },
  solid: { value: `{colors.${name}.500}` },
  focusRing: { value: `{colors.${name}.500/50}` },
  border: { value: `{colors.${name}.200}` },
});

/*
The v2 Button `colorMap` shape shared by primary and secondary:
  outline -> text/border .500, hover background .600
  ghost   -> text .700, hover background .50
*/
const buttonRoles = (name: string) => ({
  outlineFg: { value: `{colors.${name}.500}` },
  outlineBorder: { value: `{colors.${name}.500}` },
  outlineHoverBg: { value: `{colors.${name}.600}` },
  ghostFg: { value: `{colors.${name}.700}` },
  ghostHoverBg: { value: `{colors.${name}.50}` },
  /* v2 Badge `solid` fell through to Chakra's default of `.500` for every
     palette except niaid and gray, both overridden below. */
  badgeSolidBg: { value: `{colors.${name}.500}` },
  /* v2's `styleInputBorder()` focus colour — `.200` for every palette it
     handled except niaid, overridden below. */
  inputFocusBorder: { value: `{colors.${name}.200}` },
});

const palette = (name: string) => ({
  ...standard(name),
  ...buttonRoles(name),
});

export const semanticColors = defineSemanticTokens.colors({
  primary: palette('primary'),
  secondary: palette('secondary'),
  niaid: {
    ...palette('niaid'),
    // v2 Badge `solid` + colorPalette='niaid' was a literal black.
    badgeSolidBg: { value: '{colors.black}' },
    // v2 `styleInputBorder()` singled niaid out for the link colour.
    inputFocusBorder: { value: '{colors.link.default}' },
  },
  accent: palette('accent'),

  /*
  gray is the one palette whose v2 Button `outline` entry broke the shared
  pattern: text .900 (not .500), border .200 (not .500), hover .800 (not .600).
  It also needs re-declaring so `colorPalette='gray'` lands on the NIAID greys
  rather than Chakra's, since every default semantic token (bg.subtle,
  fg.muted, border) references {colors.gray.*}.
  */
  gray: {
    ...palette('gray'),
    outlineFg: { value: '{colors.gray.900}' },
    outlineBorder: { value: '{colors.gray.200}' },
    outlineHoverBg: { value: '{colors.gray.800}' },
    badgeSolidBg: { value: '{colors.gray.700}' },
  },

  /*
  Chakra already defines the eight standard roles for its own palettes, so
  these only add the custom roles — needed because `getMetadataTheme()` and
  `getColorPalette()` hand these names straight to `colorPalette`.
  */
  red: buttonRoles('red'),
  orange: buttonRoles('orange'),
  yellow: buttonRoles('yellow'),
  green: buttonRoles('green'),
  teal: buttonRoles('teal'),
  blue: buttonRoles('blue'),
  cyan: buttonRoles('cyan'),
  purple: buttonRoles('purple'),
  pink: buttonRoles('pink'),

  /*
  NIAID Digital Policies link colours.
  */
  link: {
    default: { value: '#246CD3' },
    visited: { value: '#6F57B5' },
  },
});

// [chakra-todo]: might need to include this or delete. Was in v3 old theming
// error: {
//   light: { value: '#FBF2F3' },
//   default: { value: '#D23342' },
//   contrast: { value: 'white' },
//   emphasized: { value: '{colors.error.light}' },
//   fg: { value: '{colors.error.default}' },
//   focusRing: { value: '{colors.red.500/50}' },
//   muted: { value: '#f6bec4' },
//   solid: { value: '{colors.error.default}' },
//   subtle: { value: '{colors.error.light}' },
// },
// info: {
//   light: { value: '#F3F4FC' },
//   default: { value: '#4865E3' },
//   contrast: { value: 'white' },
//   emphasized: { value: '{colors.info.light}' },
//   fg: { value: '{colors.info.default}' },
//   focusRing: { value: '#4299E199' },
//   muted: { value: '#8FA2F1' },
//   solid: { value: '{colors.info.default}' },
//   subtle: { value: '{colors.info.light}' },
// },
// success: {
//   light: { value: '#F2F5F4' },
//   default: { value: '#17805F' },
//   contrast: { value: 'white' },
//   emphasized: { value: '{colors.success.light}' },
//   fg: { value: '{colors.success.default}' },
//   focusRing: { value: '{colors.success.default}' },
//   muted: { value: '#BBF4E3' },
//   solid: { value: '{colors.success.default}' },
//   subtle: { value: '{colors.success.light}' },
// },
// warning: {
//   light: { value: '#FFF9F2' },
//   default: { value: '#FFC10A' },
//   contrast: { value: 'white' },
//   emphasized: { value: '{colors.warning.light}' },
//   fg: { value: '{colors.yellow.800}' },
//   focusRing: { value: '{colors.warning.default}' },
//   muted: { value: '#FFECAD' },
//   solid: { value: '{colors.warning.default}' },
//   subtle: { value: '{colors.warning.light}' },
// },
// bg: {
//     DEFAULT: {
//       value: '{colors.page.default}',
//     },
//     subtle: {
//       value: '{colors.page.alt}',
//     },
//     error: {
//       value: '{colors.error.light}',
//     },
//     warning: {
//       value: '{colors.warning.light}',
//     },
//     success: {
//       value: '{colors.success.light}',
//     },
//     info: {
//       value: '{colors.info.light}',
//     },
//   },
//   border: {
//     DEFAULT: {
//       value: '{colors.gray.200}',
//     },
//     error: {
//       value: '{colors.error.default}',
//     },
//     warning: {
//       value: '{colors.warning.default}',
//     },
//     success: {
//       value: '{colors.success.default}',
//     },
//     info: {
//       value: '{colors.info.default}',
//     },
//   },
//   fg: {
//     DEFAULT: {
//       value: '{colors.text.body}',
//     },
//     error: {
//       value: '{colors.error.default}',
//     },
//     warning: {
//       value: '{colors.warning.default}',
//     },
//     success: {
//       value: '{colors.success.default}',
//     },
//     info: {
//       value: '{colors.info.default}',
//     },
//     muted: { value: '{colors.text.body/80}' },
//   },
