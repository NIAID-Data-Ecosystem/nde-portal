import { FlexProps } from '@chakra-ui/react';
import React from 'react';

export interface SectionWrapperProps extends FlexProps {
  children: React.ReactNode;
  heading?: string;
  subheading?: React.ReactNode;
  hasSeparator?: boolean;
}
