import React, { useLayoutEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Button,
  HStack,
  SkeletonText,
  Tag,
  TagLabel,
  Text,
  TextProps,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { DefinedTerm } from 'src/utils/api/types';
import Tooltip from 'src/components/tooltip';
import { TagWithUrl } from 'src/components/tag-with-url';
import { Skeleton } from 'src/components/skeleton';

const DEFAULT_MAX_VISIBLE_TAGS = 10;

export const DefinedTermTagList = ({
  value,
  isLoading,
  maxVisible = DEFAULT_MAX_VISIBLE_TAGS,
}: {
  value?: DefinedTerm[];
  isLoading?: boolean;
  maxVisible?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const items: (DefinedTerm | null)[] = isLoading
    ? Array.from({ length: 3 }, () => null)
    : value ?? [];

  if (!isLoading && items.length === 0) {
    return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
  }

  const hiddenCount = isLoading ? 0 : Math.max(0, items.length - maxVisible);
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
          isLoading={isLoading}
        />
      ))}
      {shouldTruncate && (
        <Button
          variant='link'
          size='xs'
          colorScheme='primary'
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
  isLoading,
}: {
  value: string;
  noOfLines?: number;
  isLoading?: boolean;
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  const label = value || '';

  // Only show the tooltip when the label is actually clamped/overflowing.
  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }
    const el = labelRef.current;
    if (el) {
      setIsTruncated(
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      );
    }
  }, [isLoading, label, noOfLines]);

  if (isLoading) {
    return <Skeleton isLoaded={false} width='80px' height='20px' />;
  }
  return (
    <Tooltip label={label} isDisabled={!value || !isTruncated} hasArrow>
      <Box>
        <Tag
          variant='subtle'
          noOfLines={noOfLines}
          borderRadius='full'
          bg='page.alt'
          color='text.body'
        >
          <TagLabel ref={labelRef}>{label}</TagLabel>
        </Tag>
      </Box>
    </Tooltip>
  );
};

export const TextCell = ({
  value,
  isLoading,
  noOfLines,
  expandable = false,
  children,
  ...props
}: TextProps & {
  value: string;
  isLoading?: boolean;
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
    if (!expandable || isLoading) {
      return;
    }
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [expandable, isLoading, value, children, noOfLines]);

  const clampLines = expandable && expanded ? undefined : noOfLines;

  return (
    <SkeletonText
      isLoaded={!isLoading}
      noOfLines={noOfLines}
      spacing='2'
      w='100%'
    >
      <Text
        ref={textRef}
        noOfLines={clampLines}
        fontStyle={value ? 'normal' : 'italic'}
        lineHeight='shorter'
        fontSize='xs'
        {...props}
      >
        {children || value || 'not available'}
      </Text>
      {expandable && (isTruncated || expanded) && (
        <Button
          variant='link'
          size='xs'
          colorScheme='primary'
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
  isLoading,
  isExternal,
}: {
  label: string;
  url?: string;
  isLoading?: boolean;
  isExternal?: boolean;
}) => {
  return (
    <SkeletonText isLoaded={!isLoading} noOfLines={2} fontSize='xs' w='100%'>
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
