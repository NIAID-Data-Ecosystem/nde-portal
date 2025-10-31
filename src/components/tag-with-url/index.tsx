import { Tag, TagRootProps, Text } from '@chakra-ui/react';
import NextLink, { LinkProps } from 'next/link';
import React from 'react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';

interface TagWithUrlProps extends TagRootProps {
  href?: LinkProps['href'];
  label?: string;
  isExternal?: boolean;
  leftIcon?: React.ReactNode;
}

/**
 * TagWithUrl is a component that wraps a Tag component with a URL.
 * It allows the user to click on the tag and navigate to the URL.
 * @param {TagWithUrlProps} props
 * @param {string | UrlObject} props.href - The URL to navigate to.
 * @param {string} props.label - The (optional) label to display before the tag.
 * @param {boolean} props.isExternal - Whether the URL is external.
 */

export const TagWithUrl = ({
  children,
  label,
  href,
  isExternal,
  leftIcon,
  ...props
}: TagWithUrlProps) => {
  // Note: Show as plain text when there is no associated url
  // See issue: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/245
  if (!href)
    return (
      <Text
        as='span'
        fontSize={props.fontSize || 'xs'}
        fontWeight='semibold'
        mr={1}
        {...props}
      >
        {children}
      </Text>
    );
  return (
    <Tag.Root
      asChild
      size='sm'
      variant='subtle'
      alignItems='center'
      lineHeight='shorter'
      css={{
        '&:hover .tag-label': {
          textDecoration: 'none',
        },
      }}
      {...props}
    >
      <NextLink href={href} target={isExternal ? '_blank' : '_self'}>
        {leftIcon && <Tag.StartElement>{leftIcon}</Tag.StartElement>}
        <Tag.Label className='tag-label' textDecoration='underline'>
          {children}
        </Tag.Label>
        {isExternal && (
          <Tag.EndElement>
            <FaSquareArrowUpRight />
          </Tag.EndElement>
        )}
      </NextLink>
    </Tag.Root>
  );
};
