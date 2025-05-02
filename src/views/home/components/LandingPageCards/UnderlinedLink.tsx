import React from 'react';
import NextLink from 'next/link';
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react';

interface UnderlinedLinkProps extends LinkProps {
  href: string;
  children: React.ReactNode;
}

export const UnderlinedLink: React.FC<UnderlinedLinkProps> = ({
  href,
  children,
  ...props
}) => (
  <ChakraLink
    as={NextLink}
    href={href}
    textDecoration='underline'
    textDecorationThickness='1px'
    textUnderlineOffset='0.20em'
    {...props}
  >
    {children}
  </ChakraLink>
);
