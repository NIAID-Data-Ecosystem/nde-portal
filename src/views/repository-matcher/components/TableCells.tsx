import React, { useLayoutEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Button,
  HStack,
  Skeleton,
  SkeletonText,
  Tag,
  Text,
  TextProps,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { DefinedTerm } from 'src/utils/api/types';
import Tooltip from 'src/components/tooltip';

const DEFAULT_MAX_VISIBLE_TAGS = 10;

export const TagCellList = ({
  value,
  loading,
  maxVisible = DEFAULT_MAX_VISIBLE_TAGS,
  ...tagProps
}: {
  value?: DefinedTerm[];
  loading?: boolean;
  maxVisible?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const items: (DefinedTerm | null)[] = loading
    ? Array.from({ length: 3 }, () => null)
    : value ?? [];

  if (!loading && items.length === 0) {
    return <TextCell value={''} loading={loading} noOfLines={1} />;
  }

  const hiddenCount = loading ? 0 : Math.max(0, items.length - maxVisible);
  const shouldTruncate = hiddenCount > 0;
  const visibleItems =
    shouldTruncate && !expanded ? items.slice(0, maxVisible) : items;

  return (
    <HStack flexWrap='wrap'>
      {visibleItems.map((v, i) => (
        <TagCell
          key={i}
          value={v?.name || ''}
          noOfLines={1}
          loading={loading}
          {...tagProps}
        />
      ))}
      {shouldTruncate && (
        <Button
          variant='plain'
          size='xs'
          colorPalette='primary'
          fontWeight='medium'
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : `Show ${hiddenCount} more`}
        </Button>
      )}
    </HStack>
  );
};

export const TagCell = ({
  value,
  noOfLines = 2,
  loading,
  ...props
}: {
  value: string;
  noOfLines?: number;
  loading?: boolean;
} & Tag.RootProps) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  const label = value || '';

  // Only show the tooltip when the label is actually clamped/overflowing.
  useLayoutEffect(() => {
    if (loading) {
      return;
    }
    const el = labelRef.current;
    if (el) {
      setIsTruncated(
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      );
    }
  }, [loading, label, noOfLines]);

  if (loading) {
    return <Skeleton loading width='80px' height='20px' />;
  }
  return (
    <Tooltip content={label} disabled={!value || !isTruncated} showArrow>
      <Box>
        <Tag.Root
          variant='subtle'
          lineClamp={noOfLines}
          borderRadius='full'
          {...props}
        >
          <Tag.Label ref={labelRef}>{label}</Tag.Label>
        </Tag.Root>
      </Box>
    </Tooltip>
  );
};

export const TextCell = ({
  value,
  loading,
  noOfLines,
  expandable = false,
  children,
  ...props
}: TextProps & {
  value: string;
  loading?: boolean;
  // When true, the text is clamped to `noOfLines` and a "Show more"/"Show
  // less" toggle is rendered (only if the content is actually truncated).
  expandable?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Detect whether the clamped text overflows so the toggle is only shown
  // when there's hidden content to reveal.
  useLayoutEffect(() => {
    if (!expandable || loading) {
      return;
    }
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [expandable, loading, value, children, noOfLines]);

  const clampLines = expandable && expanded ? undefined : noOfLines;

  return (
    <SkeletonText loading={loading} noOfLines={noOfLines} gap='2' w='100%'>
      <Text
        ref={textRef}
        lineClamp={clampLines}
        fontStyle={value ? 'normal' : 'italic'}
        lineHeight='shorter'
        fontSize='xs'
        {...props}
      >
        {children || value || 'not available'}
      </Text>
      {expandable && (isTruncated || expanded) && (
        <Button
          variant='plain'
          size='xs'
          colorPalette='primary'
          fontWeight='medium'
          mt='1'
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
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
    <SkeletonText loading={loading} noOfLines={2} fontSize='xs' w='100%'>
      {url ? (
        <NextLink href={url} prefetch={false} passHref>
          <Link as='div' isExternal={isExternal}>
            {label}
          </Link>
        </NextLink>
      ) : (
        <Text fontSize='inherit'>{label || '-'}</Text>
      )}
    </SkeletonText>
  );
};
