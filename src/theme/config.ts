import { defineConfig } from '@chakra-ui/react';
import { globalCss } from './global-css';
import { recipes } from './recipes';
import { semanticTokens } from './semantic-tokens';
import { slotRecipes } from './slot-recipes';
import { tokens } from './tokens';
import { breakpoints } from './tokens/breakpoints';

/*
Global @keyframes. Chakra emits these as real `@keyframes <name>` rules and
registers the names as `animationName` tokens, so `animation='shake 0.2s
ease-in-out'` works from any style prop. Emotion's `keyframes` helper does not:
interpolating it into a plain template string yields the generated name without
ever inserting the rule, so the animation silently no-ops.
*/
const keyframes = {
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(0.25rem)' },
    '75%': { transform: 'translateX(-0.25rem)' },
  },
};

/*
Nothing under ./recipes or ./slot-recipes may import from this module or from
./index — they refer to tokens by name (`colorPalette.200`, `status.error`)
rather than by value. That is what keeps the cycle out: under v2, three of the
component style configs imported the very theme object they were configuring.

`cssVarsPrefix` is intentionally unset. Chakra v3 already defaults it to
`chakra`, so v2's `config.cssVarPrefix: 'chakra'` was a no-op.

`strictTokens` is left off: the app passes raw values throughout
(`fontSize='16px'`, `border='.0625rem solid'`), and turning it on would be a
change of a different scale.
*/
export const config = defineConfig({
  globalCss,
  theme: {
    breakpoints,
    keyframes,
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
});
