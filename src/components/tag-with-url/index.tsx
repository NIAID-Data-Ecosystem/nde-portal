import { Tag, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import type { UrlObject } from 'url';

interface TagWithUrlProps extends Tag.RootProps {
  href?: string | UrlObject | null;
  label?: string;
  isExternal?: boolean;
  leftIcon?: IconType;
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
  lineClamp = 1,
  ...props
}: TagWithUrlProps) => {
  const Label = () =>
    label ? (
      <Text
        as='span'
        mr={1}
        fontWeight='semibold'
        fontSize='inherit'
        color='inherit'
        lineHeight='inherit'
      >
        {label}
      </Text>
    ) : (
      <></>
    );

  // Note: Show as plain text when there is no associated url
  // See issue: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/245
  if (!href)
    return (
      <Text fontSize={props.fontSize || 'xs'} {...props}>
        <Label />
        {children}
      </Text>
    );
  return (
    <Tag.Root
      size='sm'
      variant='subtle'
      alignItems='center'
      _hover={{
        '& .tag-text': {
          textDecoration: 'none',
        },
      }}
      lineHeight='shorter'
      {...props}
      asChild
    >
      <NextLink href={href} target={isExternal ? '_blank' : '_self'}>
        {leftIcon && <Tag.StartElement as={leftIcon} mr={0} />}
        <Tag.Label fontSize='inherit' lineHeight='inherit' display='inline'>
          <Label />
          <Text
            as='span'
            className='tag-text'
            textDecoration='underline'
            fontSize='inherit'
            lineHeight='inherit'
            color='inherit'
          >
            {children}
          </Text>
        </Tag.Label>
        {isExternal && (
          <Tag.EndElement ml={1} asChild>
            <FaSquareArrowUpRight />
          </Tag.EndElement>
        )}
      </NextLink>
    </Tag.Root>
  );
};
