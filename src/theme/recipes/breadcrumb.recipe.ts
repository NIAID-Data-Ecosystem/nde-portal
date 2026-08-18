import { defineSlotRecipe } from '@chakra-ui/react';
import { breadcrumbAnatomy } from '@chakra-ui/react/anatomy';

const breadcrumb = defineSlotRecipe({
  slots: breadcrumbAnatomy.keys(),
  base: {},
  variants: {
    variant: {
      nav: {
        item: { fontWeight: 'medium' },
        link: {
          borderRadius: 'semi',
          color: 'niaid.600',
          overflow: 'hidden',
          px: 2,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          _hover: {
            bg: 'blue.50',
            color: 'link.default',
            textDecoration: 'underline',
          },
          _icon: { color: 'niaid.500' },
        },
        currentLink: {
          color: 'gray.800',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'nav',
  },
});

export default breadcrumb;
