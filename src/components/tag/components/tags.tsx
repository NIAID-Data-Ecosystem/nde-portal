import { Tag as ChakraTag } from '@chakra-ui/react';
import NextLink from 'next/link';
import { LinkProps } from 'next/link';
import React from 'react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';

import { TagProps } from '..';

// Base tag component without tooltip or link functionality.
export const BaseTag = ({ children, leftIcon, ...props }: TagProps) => {
  return (
    <ChakraTag.Root {...props}>
      {leftIcon && <ChakraTag.StartElement>{leftIcon}</ChakraTag.StartElement>}
      <ChakraTag.Label>{children}</ChakraTag.Label>
    </ChakraTag.Root>
  );
};

export interface BaseTagWithLinkProps extends TagProps {
  linkProps: LinkProps & { isExternal?: boolean };
}

export const BaseTagWithLink = ({
  children,
  leftIcon,
  linkProps,
  ...props
}: BaseTagWithLinkProps) => {
  return (
    <ChakraTag.Root
      asChild
      css={{
        '&:hover .tag-label': {
          textDecoration: 'none',
        },
      }}
      {...props}
    >
      <NextLink
        href={linkProps.href}
        target={linkProps?.isExternal ? '_blank' : '_self'}
      >
        {leftIcon && (
          <ChakraTag.StartElement>{leftIcon}</ChakraTag.StartElement>
        )}
        <ChakraTag.Label className='tag-label' textDecoration='underline'>
          {children}
        </ChakraTag.Label>
        {linkProps?.isExternal && (
          <ChakraTag.EndElement>
            <FaSquareArrowUpRight />
          </ChakraTag.EndElement>
        )}
      </NextLink>
    </ChakraTag.Root>
  );
};
