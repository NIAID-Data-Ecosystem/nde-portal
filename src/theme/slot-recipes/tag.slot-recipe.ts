import { defineSlotRecipe } from '@chakra-ui/react';
import { tagAnatomy } from '@chakra-ui/react/anatomy';

export const tagSlotRecipe = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: {
    root: { textUnderlineOffset: '0.15rem' },
    label: { textUnderlineOffset: '0.15rem' },
    closeTrigger: {
      cursor: 'pointer',
      color: 'currentColor/80',
      _hover: {
        color: 'currentColor/100',
      },
    },
  },
  variants: {
    variant: {
      solid: {},
      subtle: {},
      outline: {},
      surface: {},
    },
    size: {
      sm: {
        root: {
          minH: '5',
        },
      },
      md: {
        root: {
          px: '2',
          minH: '6',
          gap: '1.25',
          '--tag-avatar-size': 'spacing.3.5',
          '--tag-element-size': 'spacing.3.5',
          '--tag-element-offset': '-2px',
        },
        label: {
          textStyle: 'sm',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
