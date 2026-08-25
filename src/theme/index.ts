import { createSystem, defaultConfig } from '@chakra-ui/react';

import { config } from './config';

/**
 * The Chakra v3 design system. Pass to `ChakraProvider` as `value={system}`.
 *
 * This is also the only source of raw theme values. Roughly 18 modules cannot
 * accept a CSS `var()` — visx/SVG `fill` and `stroke`, react-select `styles`
 * objects, the media query strings in src/components/carousel/hooks — and they
 * read literals straight off the system:
 *
 *     system.token('colors.primary.500')  // '#0B8484'
 *     system.token('zIndex.popover')      // 1500
 *
 * `token()` resolves raw tokens, semantic tokens and Chakra's own defaults, so
 * there is no second copy of the palette to drift out of sync. Prefer design
 * tokens (`bg='primary.500'`) in anything that renders through Chakra; reach
 * for `system.token` only where a real value is required.
 */
export const system = createSystem(defaultConfig, config);

/** The numeric steps every palette in this theme defines. */
const PALETTE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

/**
 * One palette's raw hex values, keyed by numeric step. Steps a palette does not
 * define are absent, so reads are `string | undefined`.
 */
export type Palette = Partial<Record<(typeof PALETTE_STEPS)[number], string>>;

/**
 * Build a {@link Palette}.
 *
 * Only for the few chart props typed as a whole palette object rather than a
 * single colour. Use `system.token('colors.${name}.${step}')` for a single colour.
 */
export const palette = (name: string): Palette =>
  Object.fromEntries(
    PALETTE_STEPS.map(step => [step, system.token(`colors.${name}.${step}`)]) //
      .filter(([, value]) => value != null),
  );
