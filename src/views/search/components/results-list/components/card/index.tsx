import {
  Box,
  Button,
  Card,
  Collapsible,
  Flex,
  Highlight,
  HStack,
  Icon,
  IconButton,
  Separator,
  Skeleton,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { useInView } from '@react-spring/web';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import NextLink from 'next/link';
import React, { useMemo } from 'react';
import {
  FaAngleRight,
  FaChevronDown,
  FaCircleArrowRight,
  FaRegClock,
} from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { BookmarkButton } from 'src/components/bookmark-buttons/button';
import { DisplayHTMLContent } from 'src/components/html-content';
import { InfoLabel } from 'src/components/info-label';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { TypeBanner } from 'src/components/resource-sections/components';
import { SearchableItems } from 'src/components/searchable-items';
import { SourceLogo } from 'src/components/source-logo';
import {
  formatSourcesWithLogos,
  getAccessResourceURL,
} from 'src/components/source-logo/helpers';
import { ToggleContainer } from 'src/components/toggle-container';
import Tooltip from 'src/components/tooltip';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
import { FormattedResource } from 'src/utils/api/types';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { CONTENT_TYPE_TOOLTIP } from 'src/views/search/config/content-type';

import { filterWords, getContentTypeItems } from './helpers';
import MetadataAccordion from './metadata-accordion';
import OperatingSystems from './operating-systems';
interface SearchResultCardProps {
  loading?: boolean;
  data?: FormattedResource | null;
  referrerPath?: string;
  querystring: string;
}

const metadataFields = SCHEMA_DEFINITIONS as SchemaDefinitions;

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  loading,
  data,
  referrerPath,
  querystring,
}) => {
  const { user, login } = useAuth();

  const { savedDatasets, addSavedDataset, removeSavedDataset } = useUserData();
  const isFavorited = data?.id
    ? savedDatasets.some(fd => fd.dataset_id === data.id)
    : false;
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

  const paddingCard = [4, 6, 8, 10];
  // lazy load large portion of cards on scroll.
  const [cardRef, inView] = useInView({ once: true });

  const sources =
    loading || !includedInDataCatalog
      ? []
      : formatSourcesWithLogos(includedInDataCatalog) || [];

  // `about` and `exampleOfWork.about` values, merged into one unlabeled pill
  // list. Data Collections only.
  const contentTypeItems = useMemo(() => getContentTypeItems(data), [data]);

  const highlightProps = useMemo(
    () =>
      querystring === '__all__'
        ? { query: '' }
        : {
            query: filterWords(querystring),
          },
    [querystring],
  );

  // Shared by the header title link and the footer's "View resource" button.
  // referrerPath is the current path of the page - used for breadcrumbs in resources page
  const resourcePageLinkProps = {
    href: { pathname: '/resources/', query: { id, referrerPath } },
    as: `/resources?id=${id}`,
    prefetch: false,
  };

  const toggleBookmark = () => {
    if (!id) return;
    // Send logged-out users to the login page before saving.
    if (!user) {
      login();
      return;
    }
    if (isFavorited) {
      removeSavedDataset(id);
    } else {
      addSavedDataset({
        dataset_id: id,
        name: name || alternateName || 'Untitled Dataset',
        saved_at: new Date().toISOString(),
      });
    }
  };

  return (
    // {/* Banner with resource type + date of publication */}
    <Card.Root
      ref={cardRef}
      boxShadow='none'
      border='1px solid'
      borderColor='gray.100'
      size='md'
    >
      <TypeBanner
        label={formatAPIResourceTypeForDisplay(type)}
        type={type}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
      />
      {/* Card header where name of resource is a link to resource page */}
      <Card.Header
        bg='transparent'
        position='relative'
        py={4}
        color='link'
        _hover={{
          '& p': { textDecoration: 'none' },
          '& svg': {
            transform: 'translate(0px)',
            opacity: 0.9,
            transition: '0.2s ease-in-out',
          },
        }}
        _visited={{
          color: 'link',
          '& svg': { color: 'link' },
        }}
        w='100%'
      >
        <Skeleton
          loading={loading}
          minHeight={loading ? '81px' : 'unset'}
          flex={1}
        >
          <NextLink
            {...resourcePageLinkProps}
            passHref
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <DisplayHTMLContent
              lineClamp={3}
              content={name || alternateName || 'N/A'}
              fontWeight='semibold'
              color='inherit'
              fontSize='lg'
              lineHeight='moderate'
              w='100%'
              textDecoration='underline'
              _hover={{
                textDecoration: 'none',
              }}
              reactMarkdownProps={{
                linkTarget: '_blank',
                disallowedElements: ['a'],
              }}
              highlightProps={highlightProps}
            />
            <Icon
              boxSize={4}
              ml={4}
              opacity={0.6}
              transform='translate(-5px)'
              transition='0.2s ease-in-out'
            >
              <FaAngleRight />
            </Icon>
          </NextLink>
        </Skeleton>
      </Card.Header>
      <>
        {(author?.length ||
          isAccessibleForFree != null ||
          conditionsOfAccess != null) && (
          <Flex
            flexDirection={['column-reverse', 'row']}
            flexWrap={['wrap-reverse', 'wrap']}
            w='100%'
            px='calc(var(--card-padding)/2)' // divided by 2 because of toggle inner padding
            pb={0.5}
          >
            {author && (
              <ToggleContainer
                ariaLabel='Toggle authors list'
                noOfLines={1}
                px='calc(var(--card-padding)/2)'
                flex={1}
                py={1}
                fontSize='sm'
                colorPalette='gray'
                variant='ghost'
              >
                <Highlight query={highlightProps.query}>
                  {formatAuthorsList2String(author, ',', 10) || ''}
                </Highlight>
              </ToggleContainer>
            )}

            {(isAccessibleForFree != null || conditionsOfAccess != null) && (
              <Flex
                justifyContent={['flex-end']}
                alignItems='center'
                w={['100%', 'unset']}
                px='calc(var(--card-padding)/2)'
              >
                <AccessibleForFree
                  type={data?.['@type']}
                  isAccessibleForFree={isAccessibleForFree}
                  mx={1}
                />
                <ConditionsOfAccess
                  type={data?.['@type']}
                  conditionsOfAccess={conditionsOfAccess}
                  mx={1}
                />
              </Flex>
            )}
          </Flex>
        )}
      </>

      <Skeleton
        loading={loading}
        p='0px!important'
        minHeight={
          loading
            ? { base: '580px', sm: '400px', md: '330px', lg: '300px' }
            : 'unset'
        }
      >
        {inView && (
          <>
            {(date || operatingSystem) && (
              <Flex
                px='calc(var(--card-padding))'
                py={1}
                bg='secondary.50'
                alignItems='center'
              >
                <HStack
                  whiteSpace='nowrap'
                  alignItems='center'
                  fontSize='sm'
                  fontWeight='semibold'
                  flex={1}
                >
                  {date && (
                    <Tooltip content='Corresponds to the most recent of date modified, date published and date created.'>
                      <>
                        <FaRegClock />
                        <Text>{date}</Text>
                      </>
                    </Tooltip>
                  )}
                </HStack>

                {operatingSystem && <OperatingSystems data={operatingSystem} />}
              </Flex>
            )}
            <Card.Body p={0} gap={1}>
              <Wrap justifyContent='center' p='calc(var(--card-padding)/2)'>
                {data && (
                  <CompletenessBadgeCircle
                    type={data['@type']}
                    stats={data['_meta']}
                    animate={false}
                    size='md'
                    minWidth='176px'
                    px='calc(var(--card-padding)/2)'
                  />
                )}

                {description && (
                  <Collapsible.Root
                    flex={1}
                    collapsedHeight='100px'
                    collapsedWidth='100%'
                    _hover={{ bg: 'secondary.50' }}
                  >
                    <Collapsible.Trigger
                      cursor='pointer'
                      px='calc(var(--card-padding)/2)'
                      py={1}
                    >
                      <Collapsible.Content
                        position='relative'
                        _closed={{
                          _after: {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                            shadow:
                              'inset 0 -12px 12px -9px var(--shadow-color)',
                            shadowColor: 'whiteAlpha.800',
                          },
                        }}
                      >
                        <Flex
                          minWidth='200px'
                          lineClamp={10}
                          overflow='clip'
                          textAlign='left'
                          css={{
                            '& > :first-of-type': {
                              overflow: 'clip',
                            },
                          }}
                        >
                          <DisplayHTMLContent
                            content={description}
                            highlightProps={highlightProps}
                          />
                        </Flex>
                      </Collapsible.Content>
                      <Collapsible.Context>
                        {api => (
                          <HStack py={1}>
                            <Text as='span' fontSize='xs' gap={1}>
                              {api.open ? 'Show Less' : 'Show More'}
                            </Text>
                            <Icon
                              transform={
                                api.open ? 'rotate(180deg)' : undefined
                              }
                              boxSize='3'
                              transition='transform 0.2s'
                            >
                              <FaChevronDown />
                            </Icon>
                          </HStack>
                        )}
                      </Collapsible.Context>
                    </Collapsible.Trigger>
                  </Collapsible.Root>
                )}
              </Wrap>
              <MetadataAccordion data={data} />
              <Stack
                gap={1}
                separator={<Separator />}
                py={1}
                borderY='1px solid'
                borderColor='border'
                css={{
                  '& > *': {
                    px: 'var(--card-padding)',
                  },
                }}
              >
                {data?.topicCategory &&
                  data?.topicCategory.some(topic => topic.name) && (
                    <SearchableItems
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
                          fontSize='sm'
                          tooltipProps={{
                            content:
                              metadataFields['topicCategory'].description?.[
                                data['@type']
                              ],
                          }}
                        >
                          Topic Categories
                        </InfoLabel>
                      }
                    />
                  )}

                {contentTypeItems.length > 0 && (
                  <SearchableItems
                    generateButtonLabel={(
                      limit,
                      length,
                      itemLabel = 'content types',
                    ) =>
                      limit === length
                        ? `Show fewer ${itemLabel}`
                        : `Show all ${itemLabel} (${length - limit} more)`
                    }
                    itemLimit={3}
                    items={contentTypeItems}
                    // These values only exist on Data Collections, so a search
                    // without the tab param would land on the empty Datasets tab.
                    searchParams={{ tab: 'dc' }}
                    name={
                      <InfoLabel
                        tooltipProps={{ content: CONTENT_TYPE_TOOLTIP }}
                      >
                        Content Type
                      </InfoLabel>
                    }
                  />
                )}

                {data?.applicationCategory &&
                  data?.applicationCategory.length > 0 && (
                    <SearchableItems
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
                          tooltipProps={{
                            content:
                              metadataFields['applicationCategory']
                                .description?.[data['@type']],
                          }}
                        >
                          Application Categories
                        </InfoLabel>
                      }
                    />
                  )}

                {data?.programmingLanguage &&
                  data?.programmingLanguage.length > 0 && (
                    <SearchableItems
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
                          tooltipProps={{
                            content:
                              metadataFields['programmingLanguage']
                                .description?.[data['@type']],
                          }}
                        >
                          Programming Languages
                        </InfoLabel>
                      }
                    />
                  )}
              </Stack>
            </Card.Body>
            <Card.Footer
              gap={4}
              flexWrap='wrap'
              pt='calc(var(--card-padding)/2)'
              justifyContent='space-between'
              alignItems='flex-end'
            >
              <SourceLogo.Wrapper flex={1}>
                {sources.map(source => (
                  <SourceLogo.Component
                    key={source.name}
                    source={source}
                    type={type}
                    url={getAccessResourceURL({ recordType: type, source })}
                  />
                ))}
              </SourceLogo.Wrapper>

              <HStack
                flex={{ base: 1, sm: 'unset' }}
                mt={{ base: 2, sm: 0 }}
                w={{ base: '100%', md: 'unset' }}
                flexWrap='wrap'
              >
                {ENABLE_AUTH && (
                  <BookmarkButton
                    size={{ base: 'md', sm: 'sm' }}
                    minWidth={{ base: '200px', sm: 'unset' }}
                    flex={1}
                    variant={{ base: 'outline', md: 'ghost' }}
                    isFavorited={isFavorited}
                    onClick={toggleBookmark}
                    disabled={!id}
                  />
                )}
                {id && (
                  <Button
                    flex={1}
                    size={{ base: 'md', sm: 'sm' }}
                    aria-label={`Go to details about resource ${name}`}
                    asChild
                    minWidth={{ base: '200px', sm: '150px' }}
                  >
                    <NextLink {...resourcePageLinkProps} style={{ flex: 1 }}>
                      View resource
                      <FaCircleArrowRight />
                    </NextLink>
                  </Button>
                )}
              </HStack>
            </Card.Footer>
          </>
        )}
      </Skeleton>
    </Card.Root>
  );
};

export default SearchResultCard;
