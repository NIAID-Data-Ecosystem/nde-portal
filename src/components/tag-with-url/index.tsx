import { Span, Tag, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import type { UrlObject } from 'url';

interface TagWithUrlProps extends Tag.RootProps {
  /** Where the tag links to. Without one it renders as plain text. */
  href?: string | UrlObject | null;
  /** Optional prefix shown before `children`, e.g. `'DOI |'`. Never underlined. */
  label?: string;
  /** Opens `href` in a new tab and appends an external-link icon. */
  isExternal?: boolean;
  leftIcon?: IconType;
}

/**
 * A tag that links to `href`, with an optional bold `label` prefix.
 *
 * Only `children` is underlined to read as a link, and the underline clears
 * while the tag is hovered. The underline lives on the value's own span rather
 * than the anchor, because a decoration on the anchor would also be drawn
 * under the prefix.
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
  size = 'sm',
  colorPalette = 'primary',
  ...props
}: TagWithUrlProps) => {
  const prefix = label && (
    <Span mr={1} fontWeight='semibold'>
      {label}
    </Span>
  );

  if (!href) {
    return (
      <Text textStyle={size} {...props}>
        {prefix}
        {children}
      </Text>
    );
  }

  return (
    <Tag.Root
      asChild
      className='group'
      size={size}
      variant='subtle'
      colorPalette={colorPalette}
      lineHeight='shorter'
      {...props}
    >
      <NextLink href={href} target={isExternal ? '_blank' : undefined}>
        {leftIcon && <Tag.StartElement as={leftIcon} />}
        {/* `display: inline` lets the prefix and value wrap as one run of text,
          overriding the single-line clamp the recipe puts on this slot. */}
        <Tag.Label display='inline'>
          {prefix}
          <Span
            textDecoration='underline'
            _groupHover={{ textDecorationColor: 'transparent' }}
          >
            {children}
          </Span>
        </Tag.Label>
        {isExternal && <Tag.EndElement as={FaSquareArrowUpRight} />}
      </NextLink>
    </Tag.Root>
  );
};
