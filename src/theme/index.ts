import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { recipes, slotRecipes } from './recipes';
import { tokens, semanticTokens } from './tokens';
import { globalCss } from './global-css';
import { textStyles } from './tokens/text-styles';

const overrides = defineConfig({
  globalCss,
  theme: { recipes, slotRecipes, semanticTokens, textStyles, tokens },
});

export const system = createSystem(defaultConfig, overrides);
