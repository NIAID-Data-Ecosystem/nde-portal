import React from 'react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import {
  Tag,
  TagLabel,
  TagLeftIcon,
  TagProps,
  TagRightIcon,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { UrlObject } from 'url';
import { IconType } from 'react-icons';

interface TagWithUrlProps extends TagProps {
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
      <Text fontSize={props.fontSize || 'xs'} whiteSpace='nowrap' {...props}>
        <Label />
        {children}
      </Text>
    );
  return (
    <Tag
      as={NextLink}
      href={href}
      target={isExternal ? '_blank' : '_self'}
      size='sm'
      variant='subtle'
      alignItems='center'
      _hover={{
        '.tag-text': {
          textDecoration: 'none',
        },
      }}
      lineHeight='shorter'
      {...props}
    >
      {leftIcon && <TagLeftIcon as={leftIcon} />}

      <TagLabel fontSize='inherit' lineHeight='inherit'>
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
      </TagLabel>
      {isExternal && <TagRightIcon as={FaSquareArrowUpRight} ml={1} />}
    </Tag>
  );
};
