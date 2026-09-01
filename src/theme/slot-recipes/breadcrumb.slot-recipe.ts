import { defineSlotRecipe } from '@chakra-ui/react';
import { breadcrumbAnatomy } from '@chakra-ui/react/anatomy';

export const breadcrumbSlotRecipe = defineSlotRecipe({
  slots: breadcrumbAnatomy.keys(),
  base: {},
  variants: {
    variant: {
      nav: {
        list: {
          alignItems: 'center',
          px: 4,
          py: 2,
          gap: 0,
        },
        item: {
          color: 'niaid.600',
          fontWeight: 'semibold',
          lineHeight: 'shorter',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '& > *': {
            px: 2,
            py: 1,
            _icon: { color: 'niaid.500', boxSize: 4, mb: 0.5 },
          },
        },
        link: {
          borderRadius: 'semi',

          lineHeight: 'inherit',
          _hover: {
            bg: 'blue.50',
            color: 'link',
            textDecoration: 'underline',
          },
        },
        currentLink: {
          opacity: 0.8,
          lineHeight: 'inherit',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'nav',
  },
});
