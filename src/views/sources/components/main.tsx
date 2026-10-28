import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { FaUpRightFromSquare } from 'react-icons/fa6';
import { BadgeWithTooltip } from 'src/components/badges';
import { DetailsAccordion } from 'src/components/details-accordion';
import { MetadataCompatibilitySourceBadge } from 'src/components/metadata-compatibility-source-badge';
import {
  StyledCard,
  StyledCardButton,
  StyledCardDescription,
  StyledCardStack,
} from 'src/components/table-of-contents/components/card';
import { SectionHeader } from 'src/components/table-of-contents/layouts/section-header';
import { SectionSearch } from 'src/components/table-of-contents/layouts/section-search';
import { TagWithUrl } from 'src/components/tag-with-url';
import type { SourceDisplayItem } from 'src/pages/sources';
import { formatDate } from 'src/utils/api/helpers';
import { USE_MERGED_SOURCES_AND_CATALOGS } from 'src/utils/feature-flags';

interface Main {
  data?: SourceDisplayItem[];
  loading: boolean;
  metadata?: {
    version: string;
    date: string;
  } | null;
}

const Main: React.FC<Main> = ({ data, loading, metadata }) => {
  const [searchValue, setSearchValue] = useState('');

  const sources =
    data?.filter((source: { name: string }) =>
      source.name.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  return (
    <Box id='sources-main' mb={10} width='100%' height='100%'>
      <SectionHeader title='Data Sources'>
        <Button asChild colorPalette='secondary' size='sm' variant='outline'>
          <NextLink
            href='https://github.com/NIAID-Data-Ecosystem/nde-crawlers/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D'
            target='_blank'
            rel='noopener noreferrer'
          >
            Suggest a new source
            <Icon as={FaUpRightFromSquare} boxSize={3} />
          </NextLink>
        </Button>
      </SectionHeader>
      <Flex justifyContent='space-between' flexWrap='wrap-reverse'>
        <VStack minW='250px' alignItems='flex-start' m={0.5} flex={1}>
          <SkeletonText loading={loading} noOfLines={1} height={5}>
            <Flex alignItems='center'>
              <Text fontSize='sm' fontWeight='semibold'>
                API Version:
              </Text>
              {metadata?.version && (
                <TagWithUrl
                  href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
                  isExternal
                  mx={1}
                  variant='surface'
                  colorPalette='niaid'
                >
                  V.{metadata.version}
                </TagWithUrl>
              )}
            </Flex>
          </SkeletonText>
          <SkeletonText loading={loading} noOfLines={1} height={5}>
            {metadata?.date && (
              <Text fontSize='sm' lineHeight='moderate' fontWeight='semibold'>
                Data last harvested:
                <Text as='span' fontWeight='normal'>
                  {' '}
                  {formatDate(metadata?.date)}
                </Text>
              </Text>
            )}
          </SkeletonText>
        </VStack>
        <SectionSearch
          data={sources}
          size='sm'
          ariaLabel='Search for a source'
          placeholder='Search for a source'
          value={searchValue}
          handleChange={e => setSearchValue(e.currentTarget.value)}
        />
      </Flex>
      <StyledCardStack>
        {sources.map((sourceObj: SourceDisplayItem) => {
          // Metadata compatibility badge. `Source` is flattened, so
          // `parentCollection`/`metadata_completeness` sit at the top level.
          // The parent is matched by `identifier` (the hook's `key` is a
          // composite string, not the raw source id `parentCollection.id`
          // references). Resource catalogs have neither field.
          const parentCollectionInfo = sourceObj?.parentCollection?.id
            ? sources.find(
                source => source.identifier === sourceObj?.parentCollection?.id,
              )
            : null;

          const metadataCompatibilityData =
            sourceObj?.metadata_completeness ||
            parentCollectionInfo?.metadata_completeness ||
            null;

          const numberOfRecords = sourceObj.numberOfRecords ?? 0;

          return (
            <StyledCard
              // Keyed by source rather than position: each card holds its
              // mapping accordion's open state, which would otherwise move to
              // a different source when the search filter shifts the list.
              key={sourceObj.slug || sourceObj.name}
              id={sourceObj.slug}
              loading={loading}
              title={sourceObj.name}
              subtitle={
                numberOfRecords > 0
                  ? `${numberOfRecords.toLocaleString()} resources
                        available`
                  : ''
              }
              tags={
                <>
                  {sourceObj.isNiaidFunded && (
                    <BadgeWithTooltip colorPalette='blue' variant='subtle'>
                      NIAID
                    </BadgeWithTooltip>
                  )}
                </>
              }
              renderCTA={() =>
                sourceObj.searchURL ? (
                  <Flex
                    justifyContent={{ base: 'center', md: 'space-between' }}
                    flexWrap='wrap'
                    gap={2}
                    w='100%'
                  >
                    <Flex
                      flex={1}
                      visibility={
                        USE_MERGED_SOURCES_AND_CATALOGS &&
                        sourceObj.resourceCatalogIdentifier
                          ? 'visible'
                          : 'hidden'
                      }
                    >
                      <Button
                        size='sm'
                        variant='outline'
                        width={{ base: '100%', md: 'unset' }}
                        maxWidth='500px'
                        asChild
                      >
                        <NextLink
                          href={{
                            pathname: '/resources',
                            query: {
                              id: sourceObj.resourceCatalogIdentifier,
                            },
                          }}
                        >
                          Learn about source
                        </NextLink>
                      </Button>
                    </Flex>
                    <StyledCardButton
                      maxWidth='500px'
                      href={sourceObj.searchURL}
                    >
                      See search results
                    </StyledCardButton>
                  </Flex>
                ) : (
                  <></>
                )
              }
            >
              <>
                {/* Release dates */}
                <HStack>
                  {sourceObj.latestRelease && (
                    <Text fontSize='sm' fontWeight='semibold' color='text.body'>
                      Latest Release:{' '}
                      <Text as='span' fontWeight='normal'>
                        {sourceObj.latestRelease
                          ? sourceObj.latestRelease
                          : 'N/A'}
                      </Text>
                    </Text>
                  )}
                  {sourceObj.lastCurated && (
                    <Text fontSize='sm' fontWeight='semibold' color='text.body'>
                      Last Curated:{' '}
                      <Text as='span' fontWeight='normal'>
                        {sourceObj.lastCurated ? sourceObj.lastCurated : 'N/A'}
                      </Text>
                    </Text>
                  )}
                  {sourceObj.firstReleased && (
                    <Text fontSize='sm' fontWeight='semibold' color='text.body'>
                      First Released:{' '}
                      <Text as='span' fontWeight='normal'>
                        {sourceObj.firstReleased
                          ? sourceObj.firstReleased
                          : 'N/A'}
                      </Text>
                    </Text>
                  )}
                </HStack>

                {/* Description, with the link to the source's website
                inlined at the end of the text. */}
                {sourceObj?.description && (
                  <StyledCardDescription>
                    {sourceObj.url
                      ? `${sourceObj.description.trimEnd()} [Visit ${
                          sourceObj.name
                        } website](<${sourceObj.url}>)`
                      : sourceObj.description}
                  </StyledCardDescription>
                )}

                {/* Source Compatibility */}
                {metadataCompatibilityData && (
                  <Box my={2}>
                    <MetadataCompatibilitySourceBadge
                      data={metadataCompatibilityData}
                    />
                  </Box>
                )}

                {/* Property transformations table */}
                {sourceObj?.schema && (
                  <DetailsAccordion
                    variant='ruled'
                    summary={
                      <Text
                        fontFamily='heading'
                        fontWeight='semibold'
                        fontSize='md'
                        color='text.heading'
                        lineHeight='moderate'
                      >
                        Mapping of {sourceObj.name} Properties to NIAID Data
                        Ecosystem Properties
                      </Text>
                    }
                  >
                    <Box
                      mt={2}
                      position='relative'
                      overflowX='auto'
                      boxShadow='low'
                      borderRadius='semi'
                    >
                      <Box
                        as='table'
                        w='100%'
                        bg='#374151'
                        color='whiteAlpha.800'
                        textAlign='left'
                        fontSize='sm'
                      >
                        <Box as='thead' textTransform='uppercase' color='#fff'>
                          <tr>
                            <Box as='th' px={6} py={3}>
                              {sourceObj.name} Property
                            </Box>
                            <Box as='th' px={6} py={3}>
                              NIAID Data Ecosystem Property
                            </Box>
                          </tr>
                        </Box>

                        <Box as='tbody' bg='#1F2937' border='gray.100'>
                          {Object.entries(sourceObj.schema).map((item, i) => {
                            return (
                              <Box
                                as='tr'
                                key={item[0]}
                                borderBottom='1px solid'
                                borderColor='gray.700'
                              >
                                {Object.entries(item).map(field => {
                                  return (
                                    <Box
                                      as='td'
                                      key={`${field[0]}-${field[1]}`}
                                      px={6}
                                      py={2}
                                      fontWeight='medium'
                                      color='#fff'
                                      whiteSpace='nowrap'
                                    >
                                      {field[1]}
                                    </Box>
                                  );
                                })}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  </DetailsAccordion>
                )}
              </>
            </StyledCard>
          );
        })}
      </StyledCardStack>
    </Box>
  );
};

export default Main;
