import colors from './colors';
import fonts from './fonts';
import radii from './radius';
import shadows from './shadows';

export const tokens = {
  colors: colors.tokens,
  radii,
  shadows,
  ...fonts,
} as any;

export const semanticTokens = {
  colors: colors.semanticTokens,
};
