import { defineSemanticTokens } from '@chakra-ui/react';

import { semanticColors } from './colors';
import { semanticShadows } from './shadows';

export const semanticTokens = defineSemanticTokens({
  colors: semanticColors,
  shadows: semanticShadows,
});
