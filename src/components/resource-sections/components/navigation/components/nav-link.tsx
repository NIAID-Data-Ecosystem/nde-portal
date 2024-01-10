import React from 'react';
import { Link, LinkProps, Text } from 'nde-design-system';

interface NavLinkProps extends LinkProps {
  href: string;
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({
  isSelected,
  color = 'primary.500',
  borderLeftColor = 'primary.300',
  ...props
}) => {
  return (
    <Link
      variant='ghost'
      display='flex'
      lineHeight='short'
      pl={3}
      py={0.5}
      borderBottom='none!important'
      borderLeft='3px solid'
      fontSize='sm'
      fontWeight={isSelected ? 'semibold' : 'normal'}
      textDecoration={isSelected ? 'underline' : 'none'}
      borderLeftColor={isSelected ? borderLeftColor : 'transparent'}
      _visited={{
        color: isSelected ? color : 'text.body',
        borderLeftColor: isSelected ? borderLeftColor : 'transparent',
      }}
      opacity={isSelected ? 1 : 0.8}
      color={isSelected ? color : 'text.body'}
      {...props}
      _hover={{
        textDecoration: 'underline!important',
        borderBottom: 'none!important',
        '*': { borderBottom: 'none!important' },
        color: isSelected ? color : 'text.body',
        ...props._hover,
      }}
    >
      {props.children}
    </Link>
  );
};
