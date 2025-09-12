import { defineSlotRecipe } from '@chakra-ui/react';
import { cardAnatomy } from '@chakra-ui/react/anatomy';

// [TO DO]: See if custom styles (commented) from previous implementation are necessary
const card = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    root: {
      // bg: 'white',
      // boxShadow: 'base',
      // borderRadius: 'semi',
      // overflow: 'hidden',
    },
    title: {
      // pb: [2, 4],
      // display: 'flex',
      // flexWrap: 'wrap',
      // justifyContent: 'space-between',
      // alignItems: 'center',
    },
    body: {
      //       display: 'flex',
      // flexDirection: 'column',
      // pt: 0,
      // '>*': {
      //   my: 4,
      // },
      // _notLast: {
      //   pb: 0,
      // },
      // _last: {
      //   '>*': {
      //     _last: { mb: 0 },
      //   },
      // },
    },
    footer: {
      // display: 'flex',
    },
  },
  variants: {
    variant: {
      outline: {
        root: {
          borderColor: 'gray.100',
        },
      },
      elevated: {},
      niaid: {
        title: { bg: 'niaid.500', color: 'white' },
        footer: { bg: 'bg.subtle' },
      },
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
});

export default card;
