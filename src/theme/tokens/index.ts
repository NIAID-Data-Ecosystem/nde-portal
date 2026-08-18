import { defineTokens } from '@chakra-ui/react';
import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { fonts, fontSizes, lineHeights } from './typography';

type RawColors = { [key: string]: string | RawColors };

/**
 * Lift the raw hex map in ./colors into Chakra's `{ value: ... }` token shape.
 * Keeping one source of truth means the design tokens and the runtime `theme`
 * shim in ../index.ts can never drift apart.
 */
const toTokens = (input: RawColors): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === 'string' ? { value } : toTokens(value),
    ]),
  );

export const tokens = defineTokens({
  colors: toTokens(colors),
  radii,
  shadows,
  fonts,
  fontSizes,
  lineHeights,
});
