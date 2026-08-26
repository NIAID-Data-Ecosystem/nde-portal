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
import NextLink from 'next/link';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { DefinedTerm } from 'src/utils/api/types';

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
    return <TextCell value={''} loading={loading} lineClamp={1} />;
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
          lineClamp={1}
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
  }, [loading, label, lineClamp]);

  if (loading) {
    return <Skeleton loading width='80px' height='20px' />;
  }
  return (
    <Tooltip content={label} disabled={!value || !isTruncated} showArrow>
      <Box>
        <Tag.Root
          variant='subtle'
          lineClamp={lineClamp}
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
  lineClamp,
  expandable = false,
  children,
  ...props
}: TextProps & {
  value: string;
  loading?: boolean;
  // When true, the text is clamped to `lineClamp` and a "Show more"/"Show
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
  }, [expandable, loading, value, children, lineClamp]);

  const clampLines = expandable && expanded ? undefined : lineClamp;

  return (
    <SkeletonText loading={loading} lineClamp={lineClamp} gap='2' w='100%'>
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
    <SkeletonText loading={loading} lineClamp={2} fontSize='xs' w='100%'>
      {url ? (
        <Link asChild isExternal={isExternal}>
          <NextLink href={url} prefetch={false}>
            {label}
          </NextLink>
        </Link>
      ) : (
        <Text fontSize='inherit'>{label || '-'}</Text>
      )}
    </SkeletonText>
  );
};
