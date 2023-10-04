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
  borderLeftColor = 'accent.bg',
  color = 'text.body',
  ...props
}) => {
  return (
    <Link
      variant='ghost'
      display='flex'
      lineHeight='short'
      pl={3}
      borderBottom='none!important'
      borderLeft='3px solid'
      fontSize='sm'
      fontWeight={isSelected ? 'semibold' : 'normal'}
      textDecoration={isSelected ? 'underline' : 'none'}
      borderLeftColor={isSelected ? borderLeftColor : 'transparent'}
      _visited={{
        color: isSelected ? borderLeftColor : color,
        borderLeftColor: isSelected ? borderLeftColor : 'transparent',
      }}
      opacity={isSelected ? 1 : 0.7}
      color={
        isSelected
          ? typeof borderLeftColor === 'string'
            ? borderLeftColor
            : color
          : color
      }
      {...props}
      _hover={{
        textDecoration: 'underline!important',
        borderBottom: 'none!important',
        '*': { borderBottom: 'none!important' },
        color: isSelected ? borderLeftColor : color,
        ...props._hover,
      }}
    >
      {props.children}
    </Link>
  );
};
