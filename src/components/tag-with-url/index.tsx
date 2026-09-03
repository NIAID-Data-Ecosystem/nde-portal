import { Tag, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import type { UrlObject } from 'url';

import { Link } from '../link';

interface TagWithUrlProps extends Tag.RootProps {
  /** Where the tag links to. Without one it renders as plain text. */
  href?: string | UrlObject | null;
  /** Optional prefix shown before `children`, e.g. `'DOI |'`. Never underlined. */
  label?: string;
  isExternal?: boolean;
  leftIcon?: IconType;
}

/**
 * Defer typography to the tag rather than the `text` recipe, which sets its own
 * `color`, and to the caller's `fontSize` rather than the `xs` `textStyle` the
 * tag recipe puts on `Tag.Label`.
 */
const inheritTypography = {
  color: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textDecoration: 'inherit',
} as const;

/**
 * A tag that links to `href`. `children` is underlined to read as a link, and
 * the underline clears while the tag is hovered.
 *
 * Without an `href` the tag degrades to plain text instead of rendering a dead
 * link — see https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/245.
 */
export const TagWithUrl = ({
  children,
  label,
  href,
  isExternal,
  leftIcon,
  ...props
}: TagWithUrlProps) => {
  const prefix = label && (
    <Text as='span' {...inheritTypography} mr={1} fontWeight='semibold'>
      {label}
    </Text>
  );

  if (!href) {
    return (
      <Text fontSize='xs' {...props}>
        {prefix}
        {children}
      </Text>
    );
  }

  return (
    <Tag.Root
      size='sm'
      variant='subtle'
      alignItems='center'
      lineHeight='shorter'
      {...props}
      colorPalette='primary'
      asChild
    >
      <Link
        asChild
        colorPalette='primary'
        _visited={{
          color: 'colorPalette.fg',
          _icon: { color: 'colorPalette.fg' },
        }}
      >
        <NextLink href={href} target={isExternal ? '_blank' : '_self'}>
          {leftIcon && <Tag.StartElement as={leftIcon} />}
          {/* `display: inline` keeps the prefix and value on one run of text,
            overriding the line clamp the recipe puts on this slot. */}
          <Tag.Label display='inline' color='inherit' textDecoration='inherit'>
            {prefix}
            <Text as='span' {...inheritTypography}>
              {children}
            </Text>
          </Tag.Label>
          {isExternal && (
            <Tag.EndElement
              as={FaSquareArrowUpRight}
              ml={1}
              {...inheritTypography}
            />
          )}
        </NextLink>
      </Link>
    </Tag.Root>
  );
};
