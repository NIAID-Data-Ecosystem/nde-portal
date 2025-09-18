import { ButtonProps, ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type LandingPageCardData = {
  image: ImageProps;
  heading: string;
  headingHref?: string;
  descriptions: Array<{
    id: string;
    content: ReactNode;
  }>;
  footer?: {
    cta?: Array<ButtonProps & { href?: string }>;
  };
};

export type LandingPageCards = {
  [key: string]: { heading?: string; data: LandingPageCardData[] };
};
