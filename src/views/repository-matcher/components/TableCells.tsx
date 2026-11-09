import {
  Box,
  Skeleton,
  SkeletonText,
  Tag,
  Text,
  TextProps,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useRef, useState } from 'react';
import { ExpandableText } from 'src/components/expandable-cells';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

/*
Cell components still used by the saved page (src/views/saved/table-config.tsx).
The repository matcher itself now uses the shared DataTable cells; these go
when the saved page migrates too.
*/

export const TagCell = ({
  value,
  lineClamp = 2,
  loading,
  ...props
}: {
  value: string;
  lineClamp?: number;
  loading?: boolean;
} & Tag.RootProps) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  const label = value || '';

  // Only show the tooltip when the label is actually clamped/overflowing.
  useIsomorphicLayoutEffect(() => {
    if (loading) {
      return;
    }
    const el = labelRef.current;
    if (el) {
      setIsTruncated(
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      );
    }
  }, [loading, label, lineClamp]);

  if (loading) {
    return <Skeleton loading width='80px' height='20px' />;
  }
  return (
    <Tooltip content={label} disabled={!value || !isTruncated}>
      <Tag.Root variant='subtle' size='sm' rounded='full' {...props}>
        <Tag.Label ref={labelRef} lineClamp={lineClamp}>
          {label}
        </Tag.Label>
      </Tag.Root>
    </Tooltip>
  );
};

export const TextCell = ({
  value,
  loading,
  lineClamp,
  expandable = false,
  children,
  ...props
}: Omit<TextProps, 'lineClamp'> & {
  value: string;
  loading?: boolean;
  lineClamp?: number;
  // When true, the text is clamped to `lineClamp` with the search tables'
  // "Show More"/"Show Less" toggle (only if the content is actually truncated).
  expandable?: boolean;
}) => {
  return (
    <SkeletonText loading={!!loading} noOfLines={lineClamp} gap='2' w='100%'>
      {expandable && value && !children ? (
        <ExpandableText
          text={value}
          noOfLines={lineClamp}
          loading={loading}
          lineHeight='shorter'
          {...props}
        />
      ) : (
        <Text
          lineClamp={lineClamp}
          fontStyle={value ? 'normal' : 'italic'}
          lineHeight='shorter'
          fontSize='sm'
          {...props}
        >
          {children || value || 'not available'}
        </Text>
      )}
    </SkeletonText>
  );
};

export const TextCellWithLink = ({
  label,
  url,
  loading,
  isExternal,
}: {
  label: string;
  url?: string;
  loading?: boolean;
  isExternal?: boolean;
}) => {
  return (
    <SkeletonText loading={!!loading} noOfLines={2} fontSize='sm' w='100%'>
      <Box lineClamp={2}>
        {url ? (
          <Link asChild isExternal={isExternal}>
            <NextLink href={url} prefetch={false}>
              {label}
            </NextLink>
          </Link>
        ) : (
          <Text fontSize='inherit'>{label || '-'}</Text>
        )}
      </Box>
    </SkeletonText>
  );
};
