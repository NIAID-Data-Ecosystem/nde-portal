import { CardRootProps, ImageProps } from '@chakra-ui/react';
import { ArrowButtonProps } from 'src/components/button.tsx/arrow-button';

export interface AppendixCardProps extends CardRootProps {
  title: string;
  subtitle?: string;
  tags?: React.ReactNode;
  image?: ImageProps;
  cta?: Array<ArrowButtonProps>;
}
