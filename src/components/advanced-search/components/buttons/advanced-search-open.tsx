import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button, ButtonProps, Icon } from '@chakra-ui/react';

export interface AdvancedSearchButtonProps extends ButtonProps {
  onClick: ButtonProps['onClick'];
}

export const AdvancedSearchOpen: React.FC<AdvancedSearchButtonProps> = ({
  colorPalette = 'primary',
  ...props
}) => {
  const { _hover, ...rest } = props;
  return (
    <Button
      as='span'
      variant='outline'
      size='sm'
      transition='0.2s ease-in-out'
      colorPalette={colorPalette}
      fontWeight='semibold'
      _hover={{
        bg: `${colorPalette}.600`,
        color: 'white',
        transition: '0.2s ease-in-out',

        svg: {
          transform: 'translateX(-8px)',
          transition: '0.2s transform ease-in-out',
        },
        ..._hover,
      }}
      {...rest}
    >
      <Icon
        ml={2}
        boxSize={3}
        transform='translateX(-4px)'
        transition='0.2s transform ease-in-out'
        asChild
      >
        <FaMagnifyingGlass />
      </Icon>
      {props.children || 'Advanced Search'}
    </Button>
  );
};
