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
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  SearchableItem,
  SearchableItems,
} from 'src/components/searchable-items';
import { SourceLogo } from 'src/components/source-logo';
import {
  formatSourcesWithLogos,
  getAccessResourceURL,
} from 'src/components/source-logo/helpers';
import { ToggleContainer } from 'src/components/toggle-container';
import Tooltip from 'src/components/tooltip';
import { useBookmarkDataset } from 'src/hooks/useBookmarkDataset';
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

/*
 * Height of the description peek shown while the card's Collapsible is closed.
 * Descriptions shorter than this are fully visible, so there is nothing for the
 * trigger to reveal.
 */
const COLLAPSED_DESCRIPTION_HEIGHT = 100;

/* One pill list in the card's searchable metadata strip. */
interface SearchableSection {
  /** Heading shown beside the pills. */
  label: string;
  /** Plural noun used in the show more/fewer button, e.g. "topics". */
  itemLabel: string;
  tooltip?: string;
  items: SearchableItem[];
  searchParams?: Record<string, string>;
}

const generateShowAllLabel =
  (itemLabel: string) => (limit: number, length: number) =>
    limit === length
      ? `Show fewer ${itemLabel}`
      : `Show all ${itemLabel} (${(length - limit).toLocaleString()} more)`;

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  loading,
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

  const { isFavorited, toggleBookmark, isDisabled } = useBookmarkDataset({
    id,
    name: name || alternateName,
  });

  const paddingCard = [4, 6, 8, 10];
  // lazy load large portion of cards on scroll.
  const [cardRef, inView] = useInView({ once: true });

  /*
   * Whether the description is taller than the collapsed peek. Measured on the
   * description itself rather than the Collapsible content, whose height is
   * pinned to the peek while closed. Only when it is clipped does the trigger
   * have anything to show, so it stays disabled and unlabelled otherwise.
   */
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isDescriptionClipped, setIsDescriptionClipped] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) {
      setIsDescriptionClipped(false);
      return;
    }

    const checkClipped = () =>
      setIsDescriptionClipped(el.offsetHeight > COLLAPSED_DESCRIPTION_HEIGHT);

    checkClipped();

    // Catches both card resizes and description content that renders late.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(checkClipped);
    observer.observe(el);
    return () => observer.disconnect();
    // `inView` gates the card body, so the description mounts after it flips.
  }, [description, inView]);

  const sources =
    loading || !includedInDataCatalog
      ? []
      : formatSourcesWithLogos(includedInDataCatalog) || [];

  // `about` and `exampleOfWork.about` values, merged into one unlabeled pill
  // list. Data Collections only.
  const contentTypeItems = useMemo(() => getContentTypeItems(data), [data]);

  // Sections without values are dropped so the strip has no empty rows or
  // stray separators.
  const searchableSections = useMemo<SearchableSection[]>(() => {
    if (!data) return [];

    const describe = (field: string) =>
      metadataFields[field].description?.[data['@type']];

    const sections: SearchableSection[] = [
      {
        label: 'Topic Categories',
        itemLabel: 'topics',
        tooltip: describe('topicCategory'),
        items: (data.topicCategory ?? []).flatMap(({ name }) =>
          name ? [{ name, value: name, field: 'topicCategory.name' }] : [],
        ),
      },
      {
        label: 'Content Type',
        itemLabel: 'content types',
        tooltip: CONTENT_TYPE_TOOLTIP,
        items: contentTypeItems,
        // These values only exist on Data Collections, so a search without the
        // tab param would land on the empty Datasets tab.
        searchParams: { tab: 'dc' },
      },
      {
        label: 'Application Categories',
        itemLabel: 'application categories',
        tooltip: describe('applicationCategory'),
        items: (data.applicationCategory ?? []).map(value => ({
          name: value,
          value,
          field: 'applicationCategory',
        })),
      },
      {
        label: 'Programming Languages',
        itemLabel: 'languages',
        tooltip: describe('programmingLanguage'),
        items: (data.programmingLanguage ?? []).map(value => ({
          name: value,
          value,
          field: 'programmingLanguage',
        })),
      },
    ];

    return sections.filter(section => section.items.length > 0);
  }, [data, contentTypeItems]);

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

                <Collapsible.Root
                  flex={1}
                  collapsedHeight={`${COLLAPSED_DESCRIPTION_HEIGHT}px`}
                  collapsedWidth='100%'
                  disabled={!isDescriptionClipped}
                  _hover={
                    isDescriptionClipped ? { bg: 'secondary.50' } : undefined
                  }
                >
                  <Collapsible.Trigger
                    // Nothing to toggle, so keep it out of the tab order too.
                    disabled={!isDescriptionClipped}
                    cursor={isDescriptionClipped ? 'pointer' : 'default'}
                    px='calc(var(--card-padding)/2)'
                    py={1}
                  >
                    <Collapsible.Content
                      position='relative'
                      // Fade hinting at the clipped text below.
                      _closed={
                        isDescriptionClipped
                          ? {
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
                            }
                          : undefined
                      }
                    >
                      {description && (
                        <Flex
                          ref={descriptionRef}
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
                      )}
                    </Collapsible.Content>
                    {isDescriptionClipped && (
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
                    )}
                  </Collapsible.Trigger>
                </Collapsible.Root>
              </Wrap>
              <MetadataAccordion data={data} />
              {searchableSections.length > 0 && (
                <Stack
                  gap={1}
                  separator={<Separator />}
                  py={1}
                  borderTop='1px solid'
                  borderColor='border'
                  css={{
                    '& > *': {
                      px: 'var(--card-padding)',
                    },
                  }}
                >
                  {searchableSections.map(
                    ({ label, itemLabel, tooltip, items, searchParams }) => (
                      <SearchableItems
                        key={label}
                        itemLimit={3}
                        items={items}
                        searchParams={searchParams}
                        generateButtonLabel={generateShowAllLabel(itemLabel)}
                        name={
                          <InfoLabel tooltipProps={{ content: tooltip }}>
                            {label}
                          </InfoLabel>
                        }
                      />
                    ),
                  )}
                </Stack>
              )}
            </Card.Body>
            <Separator />
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
                    disabled={isDisabled}
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
