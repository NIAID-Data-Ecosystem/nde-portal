import { defineSlotRecipe } from '@chakra-ui/react';
import {
  colorPickerAnatomy,
  comboboxAnatomy,
  datePickerAnatomy,
  fieldAnatomy,
  fieldsetAnatomy,
  fileUploadAnatomy,
  listboxAnatomy,
  radioGroupAnatomy,
  selectAnatomy,
  sliderAnatomy,
} from '@chakra-ui/react/anatomy';

const label = { color: 'text.heading' };

export const inputLabelSlotRecipes = {
  colorPicker: defineSlotRecipe({
    slots: colorPickerAnatomy.keys(),
    base: { label },
  }),
  combobox: defineSlotRecipe({
    slots: comboboxAnatomy.keys(),
    base: { label },
  }),
  datePicker: defineSlotRecipe({
    slots: datePickerAnatomy.keys(),
    base: { label },
  }),
  field: defineSlotRecipe({
    slots: fieldAnatomy.keys(),
    base: { label },
  }),
  fieldset: defineSlotRecipe({
    slots: fieldsetAnatomy.keys(),
    base: { legend: label },
  }),
  fileUpload: defineSlotRecipe({
    slots: fileUploadAnatomy.keys(),
    base: { label },
  }),
  listbox: defineSlotRecipe({
    slots: listboxAnatomy.keys(),
    base: { label },
  }),
  radioGroup: defineSlotRecipe({
    slots: radioGroupAnatomy.keys(),
    base: { label },
  }),
  select: defineSlotRecipe({
    slots: selectAnatomy.keys(),
    base: { label },
  }),
  slider: defineSlotRecipe({
    slots: sliderAnatomy.keys(),
    base: { label },
  }),
};
