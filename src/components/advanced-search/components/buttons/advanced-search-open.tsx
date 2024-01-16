import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button, ButtonProps, Icon } from '@chakra-ui/react';

export interface AdvancedSearchButtonProps extends ButtonProps {
  onClick: ButtonProps['onClick'];
}

export const AdvancedSearchOpen: React.FC<AdvancedSearchButtonProps> = ({
  colorScheme = 'primary',
  ...props
}) => {
  const { _hover, ...rest } = props;
  return (
    <Button
      as='span'
      variant='outline'
      size='sm'
      transition='0.2s ease-in-out'
      colorScheme={colorScheme}
      fontWeight='semibold'
      _hover={{
        bg: `${colorScheme}.600`,
        color: 'white',
        transition: '0.2s ease-in-out',

        svg: {
          transform: 'translateX(-8px)',
          transition: '0.2s transform ease-in-out',
        },
        ..._hover,
      }}
      leftIcon={
        <Icon
          as={FaMagnifyingGlass}
          ml={2}
          boxSize={3}
          transform='translateX(-4px)'
          transition='0.2s transform ease-in-out'
        />
      }
      {...rest}
    >
      {props.children || 'Advanced Search'}
    </Button>
  );
};
