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
      // Chakra's sizes corresponds to a step lower in our tag sizes (e.g. our 'sm' tag uses Chakra's 'xs')
      // https://chakra-ui.com/docs/components/tag#sizes
      xs: {
        root: {
          px: '1.5',
          minH: '5',
          gap: '1',
          '--tag-avatar-size': 'spacing.3',
          '--tag-element-size': 'spacing.3',
          '--tag-element-offset': '0px',
        },
        label: {
          textStyle: 'xs',
        },
      },

      sm: {
        root: {
          px: '2.5',
          minH: '6',
          gap: '1.5',
          '--tag-avatar-size': 'spacing.3',
          '--tag-element-size': 'spacing.3',
          '--tag-element-offset': '-2px',
        },
        label: {
          textStyle: 'sm',
        },
      },

      md: {
        root: {
          px: '3',
          minH: '7',
          gap: '1.5',
          '--tag-avatar-size': 'spacing.4',
          '--tag-element-size': 'spacing.3.5',
          '--tag-element-offset': '-4px',
        },
        label: {
          textStyle: 'sm',
        },
      },

      lg: {
        root: {
          px: '3',
          minH: '8',
          gap: '1.5',
          '--tag-avatar-size': 'spacing.6',
          '--tag-element-offset': '0px',
          '--tag-element-size': '4',
        },
        label: {
          textStyle: 'sm',
        },
      },

      xl: {
        root: {
          px: '3',
          minH: '8',
          gap: '1.5',
          '--tag-avatar-size': 'spacing.6',
          '--tag-element-offset': '0px',
          '--tag-element-size': '4',
        },
        label: {
          textStyle: 'md',
        },
      },
      '2xl': {
        root: {
          px: '3',
          minH: '8',
          gap: '1.5',
          '--tag-avatar-size': 'spacing.6',
          '--tag-element-offset': '0px',
          '--tag-element-size': '4',
        },
        label: {
          textStyle: 'lg',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});
