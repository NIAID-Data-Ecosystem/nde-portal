import React from 'react';
import { Link, LinkProps } from 'src/components/link';

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
      variant='plain'
      display='flex'
      lineHeight='short'
      pl={3}
      py={0.5}
      borderBottom='none!important'
      borderLeft='3px solid'
      fontSize='sm'
      fontWeight={isSelected ? 'semibold' : 'normal'}
      borderLeftColor={isSelected ? borderLeftColor : 'transparent'}
      opacity={isSelected ? 1 : 0.8}
      color={isSelected ? color : 'text.body'}
      _visited={{
        color: isSelected ? color : 'text.body',
        borderLeftColor: isSelected ? borderLeftColor : 'transparent',
      }}
      _hover={{
        ...props._hover,
      }}
      {...props}
    >
      {props.children}
    </Link>
  );
};
