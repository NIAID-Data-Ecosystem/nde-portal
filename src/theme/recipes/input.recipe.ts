import { defineRecipe } from '@chakra-ui/react';

const input = defineRecipe({
  base: {
    _placeholder: {
      color: 'page.placeholder',
    },
    borderRadius: 'semi',
  },
  variants: {
    // size: {
    //   '2xs': {
    //     '--input-height': 'sizes.8',
    //   },
    //   xs: {
    //     '--input-height': 'sizes.9',
    //   },
    //   sm: {
    //     '--input-height': 'sizes.10',
    //   },
    //   md: {
    //     '--input-height': 'sizes.12',
    //   },
    //   lg: {
    //     '--input-height': 'sizes.14',
    //   },
    //   xl: {
    //     '--input-height': 'sizes.16',
    //   },
    //   '2xl': {
    //     '--input-height': 'sizes.20',
    //   },
    // },
  },
});

export default input;
