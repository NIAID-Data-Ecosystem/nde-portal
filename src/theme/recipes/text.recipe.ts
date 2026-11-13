import { defineRecipe } from '@chakra-ui/react';

/*
Chakra's `defaultConfig` ships no `text` recipe, but the `Text` component is
built with `createRecipeContext({ key: 'text' })`, so registering one here wires
it up.

Doing this as a recipe rather than a global `p` rule matters: a global would
also catch MDX prose and every non-Chakra paragraph.
*/
export const textRecipe = defineRecipe({
  base: {
    color: 'text.body',
    fontWeight: 'normal',
  },
  defaultVariants: {
    variant: 'text.body',
  },
});
