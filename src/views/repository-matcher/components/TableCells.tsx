import React, { useState } from 'react';
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
          url={v?.url || undefined}
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
  url,
  noOfLines = 2,
  isLoading,
}: {
  value: string;
  url?: string;
  noOfLines?: number;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <Skeleton isLoaded={false} width='80px' height='20px' />;
  }
  const label = value || '';
  return (
    <Tooltip label={label} isDisabled={!value} hasArrow>
      <Box>
        {url ? (
          <TagWithUrl href={url} bg='page.alt'>
            {label}
          </TagWithUrl>
        ) : (
          <Tag variant='subtle' noOfLines={noOfLines} bg='page.alt'>
            <TagLabel>{label}</TagLabel>
          </Tag>
        )}
      </Box>
    </Tooltip>
  );
};

export const TextCell = ({
  value,
  isLoading,
  noOfLines,
  children,
  ...props
}: TextProps & {
  value: string;
  isLoading?: boolean;
}) => (
  <SkeletonText
    isLoaded={!isLoading}
    noOfLines={noOfLines}
    spacing='2'
    w='100%'
  >
    <Text
      noOfLines={noOfLines}
      fontStyle={value ? 'normal' : 'italic'}
      lineHeight='shorter'
      fontSize='xs'
      {...props}
    >
      {children || value || 'not available'}
    </Text>
  </SkeletonText>
);

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
