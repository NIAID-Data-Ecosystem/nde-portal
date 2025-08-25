import { TypographyProps } from '@chakra-ui/react';

// export interface Fonts {
//   fonts: {
//     heading: string;
//     body: string;
//   };
// }

export interface Typography extends TypographyProps {
  fontSizes: {
    xs: string;
    sm: string;
  };
  lineHeights: { base: number; short: number };
}
