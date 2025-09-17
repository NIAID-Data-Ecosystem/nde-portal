import { defineSlotRecipe } from '@chakra-ui/react';
import { popoverAnatomy } from '@chakra-ui/react/anatomy';

export const popover = defineSlotRecipe({
  slots: popoverAnatomy.keys(),

  variants: {
    size: {
      xs: {
        content: {
          '--popover-padding': 'spacing.1',
        },
      },
      sm: {
        content: {
          '--popover-padding': 'spacing.3',
        },
      },
      md: {
        content: {
          '--popover-padding': 'spacing.4',
        },
      },
      lg: {
        content: {
          '--popover-padding': 'spacing.6',
        },
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export default popover;
