import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { globalCss } from './global-css';
import { recipes, slotRecipes } from './recipes';
import { semanticTokens, tokens } from './tokens';
import { textStyles } from './tokens/text-styles';

const overrides = defineConfig({
  globalCss,
  theme: { recipes, slotRecipes, semanticTokens, textStyles, tokens },
});

export const system = createSystem(defaultConfig, overrides);
