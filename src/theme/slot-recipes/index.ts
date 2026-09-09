import { alertSlotRecipe } from './alert.slot-recipe';
import { breadcrumbSlotRecipe } from './breadcrumb.slot-recipe';
import { cardSlotRecipe } from './card.slot-recipe';
import { checkboxSlotRecipe } from './checkbox.slot-recipe';
import { inputLabelSlotRecipes } from './input-label.slot-recipes';
import { menuSlotRecipe } from './menu.slot-recipe';
import { popoverSlotRecipe } from './popover.slot-recipe';
import { switchSlotRecipe } from './switch.slot-recipe';
import { tableSlotRecipe } from './table.slot-recipe';
import { tableShellSlotRecipe } from './table-shell.slot-recipe';
import { tagSlotRecipe } from './tag.slot-recipe';

export const slotRecipes = {
  /* Field-level input labels — `text.heading` across every labelled input.
     Spread first so a named recipe below can still override a slot. */
  ...inputLabelSlotRecipes,
  alert: alertSlotRecipe,
  breadcrumb: breadcrumbSlotRecipe,
  card: cardSlotRecipe,
  checkbox: checkboxSlotRecipe,
  menu: menuSlotRecipe,
  popover: popoverSlotRecipe,
  switch: switchSlotRecipe,
  table: tableSlotRecipe,
  tableShell: tableShellSlotRecipe,
  tag: tagSlotRecipe,
};
