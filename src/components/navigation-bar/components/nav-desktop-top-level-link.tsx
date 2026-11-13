import { Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';

// A component for rendering a single navigation link, which can be either internal or external. It has styling for active and hover states.
export const NavTopLevelLink = ({
  label,
  href,
  isExternal,
  isActive,
}: {
  label: string;
  href?: string;
  isExternal?: boolean;
  isActive?: boolean;
}) => {
  return (
    <Link
      asChild
      display='flex'
      alignItems='center'
      fontSize='inherit'
      variant='nav'
      data-active={isActive ? '' : undefined}
    >
      <NextLink
        href={href ?? '#'}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {label}
      </NextLink>
    </Link>
  );
};
