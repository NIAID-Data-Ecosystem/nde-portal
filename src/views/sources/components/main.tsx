import {
  Button,
  Flex,
  Icon,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { FaUpRightFromSquare } from 'react-icons/fa6';
import { Section } from 'src/components/section';
import { TagWithTooltip } from 'src/components/tag-with-tooltip';
import { TagWithUrl } from 'src/components/tag-with-url';
import { TOC } from 'src/components/toc';
import type { SourceResponse } from 'src/pages/sources';
import { formatDate } from 'src/utils/api/helpers';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';

import { CardContent } from './card';

interface Main {
  data?: SourceResponse[];
  isLoading: boolean;
  metadata?: {
    version: string;
    date: string;
  } | null;
}

const SOURCES_PAGE_COPY = {
  heading: 'Data Sources',
  search: {
    'aria-label': 'Search for a source',
    placeholder: 'Search for a source',
  },
  suggest: {
    label: 'Suggest a new source',
    href: 'https://github.com/NIAID-Data-Ecosystem/nde-crawlers/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D',
  },
};

const Main: React.FC<Main> = ({ data, isLoading, metadata }) => {
  const [schemaId, setSchemaId] = useState<string[]>([]);
  const [schemaText, setSchemaText] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const sources =
    data?.filter((source: { name: string }) =>
      source.name.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  return (
    <Section.Wrapper
      id='sources-main'
      mb={10}
      width='100%'
      height='100%'
      heading={
        <Flex justifyContent='space-between'>
          <Section.Heading>{SOURCES_PAGE_COPY.heading}</Section.Heading>
          <Button asChild colorPalette='secondary' size='sm' variant='outline'>
            <NextLink
              href={SOURCES_PAGE_COPY.suggest.href}
              target='_blank'
              rel='noopener noreferrer'
            >
              {SOURCES_PAGE_COPY.suggest.label}
              <Icon boxSize={3}>
                <FaUpRightFromSquare />
              </Icon>
            </NextLink>
          </Button>
        </Flex>
      }
      hasSeparator
    >
      <Flex flexDirection='column' width='100%'>
        {/* Search bar */}
        <Flex justifyContent='space-between' flex={1}>
          <VStack minW='250px' alignItems='flex-start' m={0.5} flex={1}>
            <SkeletonText loading={isLoading} noOfLines={1} height={5}>
              {metadata?.version && (
                <Text
                  color='text.body'
                  fontSize='xs'
                  fontWeight='semibold'
                  lineHeight='short'
                >
                  API Version:
                  <TagWithUrl
                    colorPalette='niaid'
                    variant='surface'
                    href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
                    isExternal
                    ml={1}
                  >
                    V.{metadata.version}
                  </TagWithUrl>
                </Text>
              )}
            </SkeletonText>
            <SkeletonText loading={isLoading} noOfLines={1} height={5}>
              {metadata?.date && (
                <Text fontSize='xs' lineHeight='short' fontWeight='semibold'>
                  Data last harvested:
                  <Text as='span' fontWeight='normal' ml={1}>
                    {formatDate(metadata?.date)}
                  </Text>
                </Text>
              )}
            </SkeletonText>
          </VStack>
          <Section.Search
            data={sources}
            size='sm'
            ariaLabel='Search for a source'
            placeholder='Search for a source'
            value={searchValue}
            handleChange={e => setSearchValue(e.currentTarget.value)}
            colorPalette='secondary'
          />
        </Flex>
      </Flex>

      {/* Card Stack */}
      <TOC.CardStack>
        {sources.map((sourceObj: SourceResponse, index: number) => {
          // used for metadata compatibility badge
          const parentCollectionInfo = sourceObj?.sourceInfo?.parentCollection
            ?.id
            ? sources.find(
                source =>
                  source.key === sourceObj?.sourceInfo?.parentCollection?.id,
              )
            : null;

          const metadataCompatibilityData =
            sourceObj?.sourceInfo?.metadata_completeness ||
            parentCollectionInfo?.sourceInfo.metadata_completeness ||
            null;
          return (
            <TOC.Card
              {...sourceObj}
              key={sourceObj.slug}
              id={sourceObj.slug}
              title={sourceObj.name}
              subtitle={
                sourceObj.numberOfRecords > 0
                  ? `${sourceObj.numberOfRecords.toLocaleString()} resources
                        available`
                  : ''
              }
              tags={
                sourceObj.isNiaidFunded && (
                  <TagWithTooltip colorPalette='blue' variant='surface'>
                    NIAID
                  </TagWithTooltip>
                )
              }
              footerProps={{ alignItems: 'flex-end' }}
              cta={
                sourceObj.id
                  ? [
                      {
                        href: {
                          pathname: `/search`,
                          query: {
                            q: '',
                            filters: queryFilterObject2String({
                              'includedInDataCatalog.name': [sourceObj.id],
                            }),
                          },
                        },
                        children: `Search for ${sourceObj.name} resources`,
                        hasArrow: true,
                      },
                    ]
                  : undefined
              }
              fontSize='sm'
            >
              <CardContent
                {...sourceObj}
                metadataCompatibilityData={metadataCompatibilityData}
              />
            </TOC.Card>
          );
        })}
      </TOC.CardStack>
    </Section.Wrapper>
  );
};

export default Main;
