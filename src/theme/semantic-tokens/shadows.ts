import { defineSemanticTokens } from '@chakra-ui/react';

/*
`md` has to be a *semantic* token: Chakra v3 ships no raw `tokens.shadows` at
all, so its own `semanticTokens.shadows.md` would sit in front of any raw token
of the same name and `boxShadow='md'` would silently keep Chakra's value.

`low` and `high` have no Chakra counterpart and would work either way; they live
here to stay next to `md`.

`base` is deliberately NOT here — see ../tokens/shadows.ts.
*/
export const semanticShadows = defineSemanticTokens.shadows({
  low: {
    value:
      '0px 1px 5px 0px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.12) ',
  },
  md: {
    value:
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  },
  high: {
    value:
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  },
});
