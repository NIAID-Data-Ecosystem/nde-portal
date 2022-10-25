import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Icon, Text, TextProps } from 'nde-design-system';

export interface AdvancedSearchButtonProps extends TextProps {
  onClick: (arg: React.MouseEvent<HTMLDivElement>) => void;
}

export const OpenModal: React.FC<AdvancedSearchButtonProps> = ({
  ...props
}) => {
  return (
    <>
      <Text
        as='button'
        fontStyle='italic'
        color='whiteAlpha.800'
        _hover={{
          color: 'white',
          textDecoration: 'underline',
          svg: {
            transform: 'translateX(-8px)',
            transition: '0.2s ease-in-out',
          },
        }}
        {...props}
      >
        <Icon
          as={FaSearch}
          ml={2}
          boxSize={3}
          transform='translateX(-4px)'
          transition='0.2s ease-in-out'
        ></Icon>
        Advanced Search
      </Text>
    </>
  );
};
