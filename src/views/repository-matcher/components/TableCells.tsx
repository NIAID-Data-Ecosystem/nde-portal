import React from 'react';
import NextLink from 'next/link';
import {
  Box,
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

export const DefinedTermTagList = ({
  value,
  isLoading,
}: {
  value?: DefinedTerm[];
  isLoading?: boolean;
}) => {
  const items: (DefinedTerm | null)[] = isLoading
    ? Array.from({ length: 3 }, () => null)
    : value ?? [];

  if (!isLoading && items.length === 0) {
    return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
  }
  return (
    <HStack flexWrap='wrap'>
      {items.map((v, i) => (
        <TagCell
          key={i}
          value={v?.name || ''}
          url={v?.url || undefined}
          noOfLines={1}
          isLoading={isLoading}
        />
      ))}
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
