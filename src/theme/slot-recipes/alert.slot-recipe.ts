import { defineSlotRecipe } from '@chakra-ui/react';
import { alertAnatomy } from '@chakra-ui/react/anatomy';

/** The size scale this recipe defines, without the `ConditionalValue` wrapper. */
export type AlertSize = 'sm' | 'md' | 'lg';

/*
`Alert.Root size` → the `Button size` the alert's trigger should use. Kept here
beside the scale it mirrors, but applied in JS by src/components/alert.

Maps only into the sizes ../recipes/button.recipe.ts
*/
export const ALERT_TRIGGER_SIZE = {
  sm: '2xs',
  md: 'xs',
  lg: 'md',
} as const satisfies Record<AlertSize, '2xs' | 'xs' | 'sm' | 'md'>;

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
