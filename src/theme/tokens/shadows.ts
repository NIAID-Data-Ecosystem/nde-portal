import { defineTokens } from '@chakra-ui/react';

/*
`base` is a raw token rather than a semantic one, and it has to be.

In a semantic token, `base` is the reserved condition name for the
unconditional value (`{ value: { base: ..., _dark: ... } }`). Declaring a
semantic *token* called `base` collides with that keyword and silently resolves
to undefined — which would drop `boxShadow='base'` in the seven places that use
it, including the Card recipe.

Chakra v3 has no raw shadow tokens of its own, so there is nothing here to
collide with. The rest of the scale lives in ../semantic-tokens/shadows.ts.
*/
export const shadows = defineTokens.shadows({
  base: {
    value:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
});
