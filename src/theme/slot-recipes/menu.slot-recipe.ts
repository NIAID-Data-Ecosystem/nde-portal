import { defineSlotRecipe } from '@chakra-ui/react';
import { menuAnatomy } from '@chakra-ui/react/anatomy';

/*
Chakra's default menu recipe sets no `color` on `itemGroupLabel`, so a group
heading inherits the content's `fg` and reads as the same colour as the items it
labels. It is a heading, so it takes `text.heading`.

Setting the color on the `itemGroupLabel` slot rather than on the `fg` semantic
token keeps the change to the label: items, commands and everything else still
resolve `fg` the way Chakra intends. Same approach as the checkbox and switch
recipes.
*/
export const menuSlotRecipe = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: {
    itemGroupLabel: {
      color: 'text.heading',
    },
  },
});
