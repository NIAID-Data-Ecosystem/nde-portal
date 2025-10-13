import { ButtonProps, ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type CardType = {
  image: ImageProps;
  heading: string;
  headingHref?: string;
  descriptions: Array<{
    id: string;
    content: ReactNode;
  }>;
  footer?: {
    cta?: Array<ButtonProps & { href?: string; isExternal?: boolean }>;
  };
};
