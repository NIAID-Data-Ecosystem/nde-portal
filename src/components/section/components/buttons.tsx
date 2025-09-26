import { Button, ButtonGroup, ButtonGroupProps, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { ArrowButton } from 'src/components/button.tsx/arrow-button';

import { SectionButtonProps } from '../types';

export const SectionButtonGroup = ({
  children,
  ...props
}: ButtonGroupProps) => {
  return (
    <ButtonGroup
      justifyContent='flex-end'
      w='100%'
      flexWrap={{ base: 'wrap' }}
      {...props}
    >
      {children}
    </ButtonGroup>
  );
};

export const SectionButton = (props: SectionButtonProps) => {
  return (
    <ArrowButton
      // variant={idx % 2 ? 'solid' : 'outline'}
      flex={{ base: 1, sm: 'unset' }}
      minWidth={{ base: '180px', md: 'unset' }}
      maxWidth={{ base: 'unset', md: '250px' }}
      {...props}
    />
  );
};
