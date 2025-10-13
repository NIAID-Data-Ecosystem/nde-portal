import { ButtonGroup, ButtonGroupProps } from '@chakra-ui/react';
import {
  ArrowButton,
  ArrowButtonProps,
} from 'src/components/button.tsx/arrow-button';

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

export const SectionButton = (props: ArrowButtonProps) => {
  return (
    <ArrowButton
      flex={{ base: 1, sm: 'unset' }}
      minWidth={{ base: '180px', md: 'unset' }}
      // maxWidth={{ base: 'unset', md: '250px' }}
      {...props}
      hasArrow={true}
    >
      {props.children}
    </ArrowButton>
  );
};
