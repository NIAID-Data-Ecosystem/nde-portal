import { defineSlotRecipe } from '@chakra-ui/react';
import { alertAnatomy } from '@chakra-ui/react/anatomy';

/** The size scale this recipe defines, without the `ConditionalValue` wrapper. */
export type AlertSize = 'sm' | 'md' | 'lg';

/*
`Alert.Root size` → the `Button size` the alert's triggers (Read More toggle and
close button) should use. Kept here beside the scale it mirrors, but applied in
JS by src/components/alert.

Maps only into the sizes ../recipes/button.recipe.ts
*/
export const ALERT_TRIGGER_SIZE = {
  sm: '2xs',
  md: 'xs',
  lg: 'md',
} as const satisfies Record<AlertSize, '2xs' | 'xs' | 'sm' | 'md'>;

/*
Where src/components/alert pins its absolutely positioned close button, per
`Alert.Root size`. Derived from the root's padding, the title's line height,
and the box/`_icon` size of the `ALERT_TRIGGER_SIZE` button:

  top      = py + (line height - button height) / 2  → X centred on the title
  insetEnd = px - (button width - icon width) / 2    → X flush with the padding
                                                       edge, like the indicator
  rootPe   = insetEnd + button width + gap           → content stops short of it

  sm: py/px 12, line 16, gap 8,  2xs button 24, icon 14
  md: py/px 12, line 20, gap 8,  xs  button 32, icon 14
  lg: py/px 16, line 24, gap 12, md  button 40, icon 16
*/
export const ALERT_CLOSE_TRIGGER_OFFSET = {
  sm: { top: '8px', insetEnd: '7px', rootPe: '39px' },
  md: { top: '6px', insetEnd: '3px', rootPe: '43px' },
  lg: { top: '8px', insetEnd: '4px', rootPe: '56px' },
} as const satisfies Record<
  AlertSize,
  { top: string; insetEnd: string; rootPe: string }
>;

export const alertSlotRecipe = defineSlotRecipe({
  slots: alertAnatomy.keys(),

  base: {},

  variants: {
    size: {
      sm: {},
      md: {
        root: {
          gap: '2',
          px: '3',
          py: '3',
        },
      },
      lg: {},
    },
  },

  defaultVariants: {
    size: 'md',
  },
});
