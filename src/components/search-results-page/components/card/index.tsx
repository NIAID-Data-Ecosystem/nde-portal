import React from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  Icon,
  Image,
  Link,
  Skeleton,
  Text,
  ToggleContainer,
  VisuallyHidden,
  Tooltip,
  Stack,
} from 'nde-design-system';
import {
  FaArrowAltCircleRight,
  FaChevronRight,
  FaRegClock,
} from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import {
  formatAuthorsList2String,
  formatDOI,
  getRepositoryImage,
  isSourceFundedByNiaid,
} from 'src/utils/helpers';
import { TypeBanner } from 'src/components/resource-sections/components';
import NextLink from 'next/link';
import MetadataAccordion from './metadata-accordion';
import { DisplayHTMLContent } from 'src/components/html-content';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { CompletenessBadgeBar } from 'src/components/completeness-badge';
import { HeadingWithTooltip } from 'src/components/resource-sections/components/sidebar/components/external/components/heading-with-tooltip';

interface SearchResultCardProps {
  isLoading?: boolean;
  data?: FormattedResource | null;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  isLoading,
  data,
}) => {
  const {
    id,
    alternateName,
    name,
    type,
    date,
    author,
    description,
    conditionsOfAccess,
    doi,
    includedInDataCatalog,
    isAccessibleForFree,
    url,
    sdPublisher,
  } = data || {};

  const sources =
    !isLoading && includedInDataCatalog
      ? Array.isArray(includedInDataCatalog)
        ? includedInDataCatalog
        : [includedInDataCatalog]
      : [];

  const paddingCard = [4, 6, 8, 10];

  return (
    // {/* Banner with resource type + date of publication */}
    <Card variant='colorful'>
      <TypeBanner
        type={type}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        bg='niaid.color'
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
      />
      {/* Card header where name of resource is a link to resource apge */}

      <CardHeader bg='white' position='relative' px={paddingCard} pt={4}>
        <Skeleton
          isLoaded={!isLoading}
          startColor='whiteAlpha.100'
          endColor='whiteAlpha.500'
          h={isLoading ? '20px' : 'unset'}
          w='100%'
        >
          {(name || alternateName) && (
            <NextLink
              href={{
                pathname: '/resources/',
                query: { id },
              }}
              passHref
            >
              <Flex
                h='100%'
                flexWrap='nowrap'
                alignItems='center'
                color='link.color'
                sx={{ h3: { textDecoration: 'underline' } }}
                _hover={{
                  h3: { textDecoration: 'none' },
                  svg: {
                    transform: 'translate(0px)',
                    opacity: 0.9,
                    transition: '0.2s ease-in-out',
                  },
                }}
                _visited={{
                  color: 'link.color',
                  svg: { color: 'link.color' },
                }}
              >
                <CardTitle as='h3'>
                  <DisplayHTMLContent
                    content={name || alternateName || ''}
                    fontSize='lg'
                    lineHeight='short'
                    fontWeight='semibold'
                  />
                </CardTitle>
                <Icon
                  as={FaChevronRight}
                  boxSize={4}
                  ml={4}
                  opacity={0.6}
                  transform='translate(-5px)'
                  transition='0.2s ease-in-out'
                />
              </Flex>
            </NextLink>
          )}
        </Skeleton>
      </CardHeader>

      {/* Card Content */}
      {/* Author toggle container */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '150px' : 'unset'}
        p={0}
        m={isLoading ? 4 : 0}
        startColor='page.alt'
        endColor='niaid.placeholder'
      >
        {(author?.length || isAccessibleForFree || conditionsOfAccess) && (
          <Flex
            flexDirection={['column-reverse', 'row']}
            flexWrap={['wrap-reverse', 'wrap']}
            w='100%'
            borderY='1px solid'
            borderColor='gray.100'
          >
            <ToggleContainer
              ariaLabel='Show all authors.'
              noOfLines={1}
              justifyContent='flex-start'
              m={0}
              px={paddingCard}
              py={2}
              flex={1}
              w='100%'
              _focus={{ outlineColor: 'transparent' }}
            >
              {author && (
                <Text fontSize='xs' color='text.body'>
                  {formatAuthorsList2String(author, ',', 10)}.
                </Text>
              )}
            </ToggleContainer>
            {(isAccessibleForFree === true ||
              isAccessibleForFree === false ||
              conditionsOfAccess) && (
              <Flex
                justifyContent={['flex-end']}
                alignItems='center'
                w={['100%', 'unset']}
                flex={[1, 'unset']}
                p={[0.5, 2]}
              >
                <AccessibleForFree
                  isAccessibleForFree={isAccessibleForFree}
                  mx={1}
                />
                <ConditionsOfAccess
                  conditionsOfAccess={conditionsOfAccess}
                  mx={1}
                />
              </Flex>
            )}
          </Flex>
        )}

        <CardBody p={0}>
          {date && (
            <Flex
              px={paddingCard}
              m={0}
              flex={1}
              borderRadius='semi'
              bg='secondary.50'
              fontWeight='semibold'
              whiteSpace='nowrap'
              alignItems='center'
            >
              <Tooltip
                label='Corresponds to the most recent of date modified, date published and date created.'
                hasArrow
                bg='#fff'
                sx={{
                  color: 'text.body',
                }}
              >
                <Flex whiteSpace='nowrap' alignItems='center'>
                  <Icon as={FaRegClock} mr={2} />
                  <Text fontSize='xs'>{date}</Text>
                </Flex>
              </Tooltip>
            </Flex>
          )}
          {/* Description Text */}
          {description && (
            <ToggleContainer
              ariaLabel='show more description'
              noOfLines={[3, 10]}
              px={paddingCard}
              py={[2, 4, 6]}
              my={0}
              borderColor='transparent'
              justifyContent='space-between'
              _hover={{ bg: 'page.alt' }}
              _focus={{ outlineColor: 'transparent', bg: 'white' }}
              alignIcon='center'
            >
              <DisplayHTMLContent content={description || ''} />
            </ToggleContainer>
          )}
          <MetadataAccordion data={data} />
          {/* Source Repository Link + Altmetric badge */}
          {(doi || sources.length > 0) && (
            <Flex
              flexWrap='wrap'
              alignItems='center'
              px={paddingCard}
              py={2}
              my={0}
              flexDirection='row'
              w='100%'
            >
              {/* Source repository */}
              {(sources.length > 0 ||
                doi ||
                (sdPublisher && sdPublisher.length > 0)) && (
                <>
                  {sources.map(source => {
                    const source_logo = getRepositoryImage(source.name);

                    return (
                      <Box key={source.name} pr={paddingCard} py={2}>
                        {source_logo ? (
                          source.url ? (
                            <NextLink target='_blank' href={source.url}>
                              <Image
                                w='auto'
                                h='40px'
                                maxW='250px'
                                mr={4}
                                src={`${source_logo}`}
                                alt='Data source name'
                              />
                            </NextLink>
                          ) : (
                            <Image
                              w='auto'
                              h='40px'
                              maxW='250px'
                              mr={4}
                              src={`${source_logo}`}
                              alt='Data source name'
                            />
                          )
                        ) : (
                          <></>
                        )}
                        <Flex>
                          {url ? (
                            <Link
                              href={url! || source.url!}
                              isExternal
                              lineHeight='short'
                            >
                              <Text fontSize='xs' lineHeight='short'>
                                Provided by {source.name}
                              </Text>
                            </Link>
                          ) : (
                            <Text fontSize='xs' lineHeight='short'>
                              Provided by {source.name}
                            </Text>
                          )}
                        </Flex>
                      </Box>
                    );
                  })}

                  {/* {sdPublisher && (
                    <Box>
                      <Text
                        fontSize='xs'
                        fontWeight='medium'
                        lineHeight='short'
                      >
                        Original Source
                        <br />
                        <Text
                          as='span'
                          fontSize='xs'
                          fontStyle='italic'
                          lineHeight='short'
                        >
                          {sdPublisher?.map((publisher, i) => {
                            return publisher?.url ? (
                              <Link key={i} href={publisher.url} isExternal>
                                {publisher.name}
                              </Link>
                            ) : (
                              publisher.name || publisher.identifier
                            );
                          })}
                        </Text>
                      </Text>
                    </Box>
                  )} */}

                  <Flex
                    flex={1}
                    flexDirection='column'
                    alignItems={{ base: 'flex-start', md: 'flex-end' }}
                    py={{ base: 2, md: 2 }}
                  >
                    <Stack
                      flexDirection={{ base: 'column', md: 'column' }}
                      spacing={{ base: 2, md: 1 }}
                    >
                      {doi && (
                        <Flex
                          flexDirection='column'
                          justifyContent='flex-start'
                        >
                          <HeadingWithTooltip
                            label='Altmetric Score'
                            as='p'
                            tooltipLabel='Score attributed to dataset based on relevant online attention.'
                          />

                          {/* Altmetric embed badges don't allow for adding aria-label so VisuallyHidden is a patch */}
                          <VisuallyHidden>
                            Embedded badge for Altmetric scoring. Clicking on
                            the badge will take you to the Altmetric page for
                            this resource.
                          </VisuallyHidden>
                          <div
                            style={{
                              transform: 'translate(0px, -6px)',
                              height: '20px',
                            }}
                            role='link'
                            data-badge-popover='left'
                            data-badge-type='bar'
                            data-doi={formatDOI(doi)}
                            className='altmetric-embed'
                            data-link-target='blank'
                          ></div>
                        </Flex>
                      )}
                      {data && data['_meta'] && (
                        <Flex
                          flexDirection='column'
                          justifyContent='flex-start'
                        >
                          <HeadingWithTooltip
                            label='Completeness Score'
                            as='p'
                            tooltipLabel='Lorem ipsum.'
                          />
                          <CompletenessBadgeBar stats={data['_meta']} />
                        </Flex>
                      )}
                    </Stack>
                  </Flex>
                </>
              )}
            </Flex>
          )}
        </CardBody>
      </Skeleton>
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '50px' : 'unset'}
        p={0}
        m={isLoading ? 4 : 0}
        startColor='page.alt'
        endColor='niaid.placeholder'
      >
        <CardFooter
          alignItems='center'
          flexWrap='wrap'
          bg='page.alt'
          px={paddingCard}
          py={2}
          w='100%'
          justifyContent='flex-end'
        >
          {id && (
            <NextLink
              href={{
                pathname: '/resources/',
                query: { id },
              }}
              passHref
            >
              <Button
                as='span'
                maxW={{ xl: '230px' }}
                w='100%'
                size='sm'
                rightIcon={<FaArrowAltCircleRight />}
                aria-label={`Go to details about resource ${name}`}
              >
                See more
                <VisuallyHidden> details about the dataset</VisuallyHidden>
              </Button>
            </NextLink>
          )}
        </CardFooter>
      </Skeleton>
    </Card>
  );
};

export default SearchResultCard;
