import {
  Box,
  Card,
  Flex,
  Highlight,
  Icon,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useInView } from '@react-spring/web';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import NextLink from 'next/link';
import React, { useMemo } from 'react';
import { FaAngleRight, FaRegClock } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { ArrowButton } from 'src/components/button/arrow-button';
import { DisplayHTMLContent } from 'src/components/html-content';
import { InfoLabel } from 'src/components/info-label';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { SearchableItems } from 'src/components/searchable-items';
import { ToggleContainer } from 'src/components/toggle-container';
import { Tooltip } from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';

import { CompactCard } from '../carousel-compact-card/compact-card';
import { filterWords } from './helpers';
import MetadataAccordion from './metadata-accordion';
import OperatingSystems from './operating-systems';
import { getSourceDetails, SourceLogo } from './source-logo';

interface SearchResultCardProps {
  isLoading?: boolean;
  data?: FormattedResource | null;
  referrerPath?: string;
  querystring: string;
}

const metadataFields = SCHEMA_DEFINITIONS as SchemaDefinitions;
const CARD_PADDING = 4;

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  isLoading,
  data,
  referrerPath,
  querystring,
}) => {
  const {
    ['@type']: type,
    id,
    alternateName,
    name,
    date,
    author,
    description,
    conditionsOfAccess,
    includedInDataCatalog,
    isAccessibleForFree,
    operatingSystem,
    url,
  } = data || {};

  // lazy load large portion of cards on scroll.
  const [cardRef, inView] = useInView({ once: true });

  const sources =
    isLoading || !includedInDataCatalog
      ? []
      : getSourceDetails(includedInDataCatalog);

  const highlightProps = useMemo(
    () =>
      querystring === '__all__'
        ? { query: '' }
        : {
            query: filterWords(querystring),
          },
    [querystring],
  );

  return (
    // {/* Banner with resource type + date of publication */}
    <Box ref={cardRef}>
      <CompactCard.Base colorPalette='primary'>
        <CompactCard.Banner
          label={formatAPIResourceTypeForDisplay(type)}
          type={type}
          isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
          isLoading={isLoading}
        />

        {/* Card header where name of resource is a link to resource page */}
        <CompactCard.Header
          asChild
          isLoading={isLoading}
          display='flex'
          flexDirection='row'
          alignItems='center'
          color='link.default'
          textDecoration='underline'
          _hover={{
            textDecoration: 'none',
            '& > svg': {
              transform: 'translate(0px)',
              opacity: 0.9,
              transition: '0.2s ease-in-out',
            },
          }}
          _visited={{
            color: 'link.default',
            '& > svg': { color: 'link.default' },
          }}
        >
          <NextLink
            as={`/resources?id=${id}`}
            href={{
              pathname: '/resources/',
              query: { id, referrerPath },
            }}
          >
            {/* Name */}
            <Card.Title flex={1} color='inherit' lineHeight='short'>
              <DisplayHTMLContent
                content={name || alternateName || ''}
                lineClamp={3}
                fontSize='lg'
                reactMarkdownProps={{
                  linkTarget: '_blank',
                  disallowedElements: ['a'],
                }}
                highlightProps={highlightProps}
              />
            </Card.Title>
            <Icon
              as={FaAngleRight}
              boxSize={4}
              ml={4}
              opacity={0.6}
              transform='translate(-5px)'
              transition='0.2s ease-in-out'
            />
          </NextLink>
        </CompactCard.Header>

        <Skeleton
          loading={isLoading}
          p='0px!important'
          minHeight={
            isLoading
              ? { base: '580px', sm: '400px', md: '330px', lg: '300px' }
              : 'unset'
          }
        >
          {inView && (
            <>
              {/* Authors */}
              {(author?.length ||
                isAccessibleForFree ||
                conditionsOfAccess) && (
                <Stack
                  flexDirection={{ base: 'column-reverse', md: 'row' }}
                  flexWrap={{ base: 'wrap-reverse', md: 'wrap' }}
                  w='100%'
                  borderY='1px solid'
                  borderColor='gray.100'
                  gap={0}
                >
                  {author && (
                    <ToggleContainer
                      flexProps={{
                        lineHeight: 'short',
                      }}
                      flex={3}
                      px={CARD_PADDING}
                      py={1}
                      fontSize='sm'
                    >
                      <Highlight query={highlightProps.query}>
                        {formatAuthorsList2String(author, ',', 10) || ''}
                      </Highlight>
                    </ToggleContainer>
                  )}

                  {/* Access condition badges */}
                  {(isAccessibleForFree !== null ||
                    conditionsOfAccess !== null) && (
                    <Stack
                      flexDirection='row'
                      alignItems='flex-start'
                      px={CARD_PADDING}
                      py={2.5}
                      bg='primary.50'
                    >
                      <AccessibleForFree
                        type={data?.['@type']}
                        isAccessibleForFree={isAccessibleForFree}
                      />
                      <ConditionsOfAccess
                        type={data?.['@type']}
                        conditionsOfAccess={conditionsOfAccess}
                      />
                    </Stack>
                  )}
                </Stack>
              )}

              {(date || operatingSystem) && (
                <Flex
                  px={CARD_PADDING}
                  flex={1}
                  borderRadius='semi'
                  bg='secondary.50'
                  fontWeight='semibold'
                  whiteSpace='nowrap'
                  alignItems='center'
                  justify='space-between'
                >
                  {/* Date (published,modified,created) */}
                  {date && (
                    <Tooltip
                      content='Corresponds to the most recent of date modified, date published and date created.'
                      showArrow
                    >
                      <Text
                        fontSize='xs'
                        whiteSpace='nowrap'
                        display='flex'
                        alignItems='center'
                      >
                        <Icon as={FaRegClock} mr={2} /> {date}
                      </Text>
                    </Tooltip>
                  )}
                  {/* Supported OS (computational too only) */}
                  {operatingSystem && (
                    <OperatingSystems data={operatingSystem} />
                  )}
                </Flex>
              )}
              <Stack
                px={CARD_PADDING}
                flexDirection={{ base: 'column', md: 'row' }}
                gap={4}
              >
                {/* Metadata Completeness badge */}
                {data && (
                  <CompletenessBadgeCircle
                    type={data['@type']}
                    stats={data['_meta']}
                    animate={false}
                    size='md'
                    minWidth='176px'
                    py={4}
                    alignSelf={{ base: 'center', md: 'flex-start' }}
                  />
                )}

                {/* Description */}
                {description ? (
                  <ToggleContainer
                    collapsedHeight='135px'
                    flexProps={{ px: { base: 2, md: 4 } }}
                    py={{ base: 0, md: 4 }}
                    fontSize='sm'
                  >
                    <DisplayHTMLContent
                      content={description}
                      highlightProps={highlightProps}
                      fontSize='inherit'
                      css={{
                        '& > p': { lineHeight: 'short' },
                      }}
                    />
                  </ToggleContainer>
                ) : (
                  <Text fontSize='sm' lineHeight='short' py={4}>
                    No description available.
                  </Text>
                )}
              </Stack>

              {/* Metadata tags */}
              <MetadataAccordion data={data} />

              {/* Topic Categories */}
              {data?.topicCategory &&
                data?.topicCategory.some(topic => topic.name) && (
                  <Flex
                    borderBottom='1px solid'
                    borderBottomColor='gray.200'
                    px={CARD_PADDING}
                    py={1}
                  >
                    <SearchableItems.Wrapper>
                      <SearchableItems.List
                        generateButtonLabel={(
                          limit,
                          length,
                          itemLabel = 'topics',
                        ) =>
                          limit === length
                            ? `Show fewer ${itemLabel}`
                            : `Show all ${itemLabel} (${length - limit} more)`
                        }
                        itemLimit={3}
                        items={(data?.topicCategory ?? []).flatMap(topic =>
                          typeof topic?.name === 'string'
                            ? [
                                {
                                  name: topic.name,
                                  value: topic.name,
                                  field: 'topicCategory.name',
                                },
                              ]
                            : [],
                        )}
                        name={
                          <InfoLabel
                            title='Topic Categories'
                            tooltipText={
                              metadataFields['topicCategory'].description?.[
                                data['@type']
                              ]
                            }
                          />
                        }
                      />
                    </SearchableItems.Wrapper>
                  </Flex>
                )}

              {/* Application Categories (Computational tools only)*/}
              {data?.applicationCategory &&
                data?.applicationCategory.length > 0 && (
                  <Flex
                    borderBottom='1px solid'
                    borderBottomColor='gray.200'
                    px={CARD_PADDING}
                    py={1}
                  >
                    <SearchableItems.Wrapper>
                      <SearchableItems.List
                        generateButtonLabel={(
                          limit,
                          length,
                          itemLabel = 'Application Categories',
                        ) =>
                          limit === length
                            ? `Show fewer ${itemLabel}`
                            : `Show all ${itemLabel} (${length - limit} more)`
                        }
                        itemLimit={3}
                        items={data?.applicationCategory.map(ac => ({
                          name: ac,
                          value: ac,
                          field: 'applicationCategory',
                        }))}
                        name={
                          <InfoLabel
                            title='Application Categories'
                            tooltipText={
                              metadataFields['applicationCategory']
                                .description?.[data['@type']]
                            }
                          />
                        }
                      />
                    </SearchableItems.Wrapper>
                  </Flex>
                )}

              {/* Programming languages (Computational tools only)*/}
              {data?.programmingLanguage &&
                data?.programmingLanguage.length > 0 && (
                  <Flex
                    borderBottom='1px solid'
                    borderBottomColor='gray.200'
                    px={CARD_PADDING}
                    py={1}
                  >
                    <SearchableItems.Wrapper>
                      <SearchableItems.List
                        generateButtonLabel={(
                          limit,
                          length,
                          itemLabel = 'languages',
                        ) =>
                          limit === length
                            ? `Show fewer ${itemLabel}`
                            : `Show all ${itemLabel} (${length - limit} more)`
                        }
                        itemLimit={3}
                        items={data?.programmingLanguage.map(pl => ({
                          name: pl,
                          value: pl,
                          field: 'programmingLanguage',
                        }))}
                        name={
                          <InfoLabel
                            title='Programming Languages'
                            tooltipText={
                              metadataFields['programmingLanguage']
                                .description?.[data['@type']]
                            }
                          />
                        }
                      />
                    </SearchableItems.Wrapper>
                  </Flex>
                )}

              <Stack
                flexDirection={{ base: 'column', sm: 'row' }}
                alignItems={{ base: 'unset', sm: 'flex-end' }}
                px={CARD_PADDING}
                py={2}
              >
                <Flex
                  flex={1}
                  gap={4}
                  width={{ base: '100%', sm: 'unset' }}
                  flexWrap='wrap'
                >
                  {sources?.length > 0 &&
                    sources.map(source => {
                      return (
                        <SourceLogo
                          key={source.name}
                          source={source}
                          type={type}
                          url={
                            type === 'ResourceCatalog'
                              ? ''
                              : Array.isArray(source?.archivedAt)
                              ? source?.archivedAt[0]
                              : source?.archivedAt ?? ''
                          }
                        />
                      );
                    })}
                </Flex>

                {id && (
                  <ArrowButton
                    href={{
                      pathname: '/resources/',
                      query: { id, referrerPath },
                    }}
                    hasArrow
                  >
                    View resource
                  </ArrowButton>
                )}
              </Stack>
            </>
          )}
        </Skeleton>
      </CompactCard.Base>
    </Box>
  );
};

export default SearchResultCard;
