import React from 'react';
import { Box, Link } from '@chakra-ui/react';
import { SHARED_DESKTOP_ACTION_STYLES } from './styles';

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
      href={href ?? '#'}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      variant='unstyled'
      __css={SHARED_DESKTOP_ACTION_STYLES}
      _hover={{ bg: 'whiteAlpha.300', color: 'white' }}
      _visited={{ color: 'white', _hover: { color: 'white' } }}
    >
      {label}
      {isActive && <Box bg='white' width='100%' height={0.5} />}
    </Link>
  );
};
