import { defineSlotRecipe } from '@chakra-ui/react';
import { checkboxAnatomy } from '@chakra-ui/react/anatomy';

/*
Chakra's default checkbox recipe sets no `color` on the `label` slot, so the
label inherits from whatever wraps it. Inside a `Menu.Item` (see
`src/components/checkbox-list`) that is `color: 'fg'`, which resolves to
`colors.black` — not the app's `text.body`.

Setting the color on the `label` slot rather than on the `fg` semantic token
keeps the change to checkbox labels: menu items, buttons and everything else
still resolve `fg` the way Chakra intends. Same approach as the switch recipe.
*/
export const checkboxSlotRecipe = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    label: {
      color: 'text.body',
    },
  },
});
