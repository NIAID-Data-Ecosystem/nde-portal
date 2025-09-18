import { ButtonProps, ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export type LandingPageCard = {
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

export type LandingPageSections = {
  [key: string]: {
    heading?: string;
    subheading?: React.ReactNode;
    hasSeparator?: boolean;
    data?: LandingPageCard[];
  };
};
