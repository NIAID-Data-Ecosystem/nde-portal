import { ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { ArrowButtonProps } from 'src/components/button/arrow-button';

export type LandingPageCardType = {
  image: ImageProps;
  heading: string;
  headingHref?: string;
  descriptions: Array<{
    id: string;
    content: ReactNode;
  }>;
  footer?: {
    cta?: Array<ArrowButtonProps>;
  };
};

export type LandingPageSections = {
  [key: string]: {
    heading?: string;
    subheading?: React.ReactNode;
    hasSeparator?: boolean;
    data?: LandingPageCardType[];
    cta?: Array<ArrowButtonProps>;
  };
};
