import { createSystem, defaultConfig } from '@chakra-ui/react';
import { config } from './config';
import { colors } from './tokens/colors';
import { breakpoints } from './tokens/breakpoints';

/**
 * The Chakra v3 design system. Pass to `ChakraProvider` as `value={system}`.
 */
export const system = createSystem(defaultConfig, config);

export { colors, breakpoints };

/*
The app never uses Chakra's colour mode. There is no `useColorMode`,
`useColorModeValue` or `ColorModeScript` anywhere, and it should stay that way,
which is why `next-themes` is not a dependency and the CLI's color-mode snippet
is not generated.

Nothing needs to force light mode: v3's `_dark` condition is class-scoped
(`.dark &, .dark .chakra-theme:not(.light) &`), so with no ancestor ever
carrying `.dark`, every dark rule is unmatched and the light values apply.
*/

/*
Chakra v2's font size scale, with this theme's `xs`/`sm` overrides applied.
Only needed by the shim below — the design system gets these from ./tokens.
*/
const fontSizes = {
  '3xs': '0.45rem',
  '2xs': '0.625rem',
  xs: '0.875rem',
  sm: '0.937rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

/**
 * Raw theme values for consumers that cannot accept a CSS `var()`.
 *
 * `createSystem` returns a `SystemContext`, not a plain theme object — there is
 * no `system.colors.primary[500]`. But roughly 18 modules need literal strings:
 * visx/SVG `fill` and `stroke`, react-select `styles` objects, and the media
 * query strings built in src/components/carousel/hooks/useCarouselState.
 *
 * This mirrors what v2 exported, so those call sites are unchanged. Prefer
 * design tokens (`bg='primary.500'`) in anything that renders through Chakra;
 * reach for this only where a real value is required.
 */
export const theme = {
  colors,
  breakpoints,
  fonts: {
    heading: 'var(--font-public-sans)',
    body: 'var(--font-public-sans)',
  },
  fontSizes,
};
