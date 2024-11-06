import React, { useMemo } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Text,
  Tooltip,
  Stack,
  Highlight,
} from '@chakra-ui/react';
import { useInView } from '@react-spring/web';
import NextLink from 'next/link';
import { FaCircleArrowRight, FaAngleRight, FaRegClock } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import MetadataAccordion from './metadata-accordion';
import TopicCategories from './topic-categories';
import ApplicationCategories from './application-categories';
import ProgrammingLanguages from './programming-languages';
import { DisplayHTMLContent } from 'src/components/html-content';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { SourceLogo, getSourceDetails } from './source-logo';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { ToggleContainer } from 'src/components/toggle-container';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { Skeleton } from 'src/components/skeleton';
import { filterWords } from './helpers';

interface SearchResultCardProps {
  isLoading?: boolean;
  data?: FormattedResource | null;
  referrerPath?: string;
  querystring: string;
}

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
    url,
  } = data || {};

  const paddingCard = [4, 6, 8, 10];
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
    <Card ref={cardRef} variant='niaid' my={4} mb={8}>
      <TypeBanner
        type={type || 'Dataset'}
        p={0}
        pl={[2, 4, 6]}
        flexDirection={['column', 'row']}
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
      />

      {/* Card header where name of resource is a link to resource page */}
      <CardHeader
        bg='transparent'
        position='relative'
        px={paddingCard}
        pt={4}
        color='link.color'
        _hover={{
          p: { textDecoration: 'none' },
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
        w='100%'
      >
        <Skeleton
          isLoaded={!isLoading}
          minHeight={isLoading ? '81px' : 'unset'}
          flex={1}
        >
          <NextLink
            // referrerPath is the current path of the page - used for breadcrumbs in resources page
            href={{
              pathname: '/resources/',
              query: { id, referrerPath },
            }}
            as={`/resources?id=${id}`}
            passHref
            prefetch={false}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <DisplayHTMLContent
              noOfLines={3}
              content={name || alternateName || ''}
              fontWeight='semibold'
              color='inherit'
              fontSize='lg'
              lineHeight='short'
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
              as={FaAngleRight}
              boxSize={4}
              ml={4}
              opacity={0.6}
              transform='translate(-5px)'
              transition='0.2s ease-in-out'
            />
          </NextLink>
        </Skeleton>
      </CardHeader>
      <Skeleton
        isLoaded={!isLoading}
        p='0px!important'
        minHeight={
          isLoading
            ? { base: '580px', sm: '400px', md: '330px', lg: '300px' }
            : 'unset'
        }
      >
        {inView && (
          <>
            {(author?.length || isAccessibleForFree || conditionsOfAccess) && (
              <Flex
                flexDirection={['column-reverse', 'row']}
                flexWrap={['wrap-reverse', 'wrap']}
                w='100%'
                borderY='1px solid'
                borderColor='gray.100'
              >
                {author && (
                  <ToggleContainer
                    ariaLabel=''
                    noOfLines={1}
                    justifyContent='flex-start'
                    m={0}
                    px={paddingCard}
                    py={2}
                    flex={1}
                    w='100%'
                    _focus={{ outlineColor: 'transparent' }}
                    fontSize='xs'
                    color='text.body'
                  >
                    <Highlight query={highlightProps.query}>
                      {formatAuthorsList2String(author, ',', 10) || ''}
                    </Highlight>
                  </ToggleContainer>
                )}
                {(typeof isAccessibleForFree !== undefined ||
                  typeof isAccessibleForFree !== null ||
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

              <Stack
                px={paddingCard}
                py={[0, 1]}
                my={1}
                flexDirection={{ base: 'column', md: 'row' }}
                spacing={[1, 3, 4]}
              >
                {data && (
                  <CompletenessBadgeCircle
                    type={data['@type']}
                    stats={data['_meta']}
                    animate={false}
                    size='md'
                    minWidth='176px'
                    p={0}
                  />
                )}
                <Flex
                  display={{ base: 'block', sm: 'none' }}
                  px={2}
                  py={{ base: 1, sm: 3 }}
                  flexDirection={{ base: 'row', sm: 'column' }}
                  alignItems='center'
                  border={{ base: '1px', sm: 'none' }}
                  borderColor='gray.100'
                  borderRadius='semi'
                  justifyContent='center'
                >
                  <SourceLogo sources={sources} url={url} />
                </Flex>

                {description && (
                  <ToggleContainer
                    ariaLabel=''
                    noOfLines={[3, 10]}
                    px={4}
                    py={2}
                    my={0}
                    borderColor='transparent'
                    justifyContent='space-between'
                    _hover={{ bg: 'page.alt' }}
                    _focus={{ outlineColor: 'transparent', bg: 'white' }}
                    alignIcon='center'
                    borderRadius='semi'
                    flex={1}
                  >
                    <DisplayHTMLContent
                      content={description}
                      highlightProps={highlightProps}
                    />
                  </ToggleContainer>
                )}
              </Stack>

              <MetadataAccordion data={data} />

              {data?.topicCategory && data?.topicCategory.length > 0 && (
                <TopicCategories
                  type={data['@type']}
                  data={data.topicCategory}
                  px={paddingCard}
                />
              )}

              {data?.applicationCategory &&
                data?.applicationCategory.length > 0 && (
                  <ApplicationCategories
                    data={data.applicationCategory}
                    px={paddingCard}
                  />
                )}

              {data?.programmingLanguage &&
                data?.programmingLanguage.length > 0 && (
                  <ProgrammingLanguages
                    data={data.programmingLanguage}
                    px={paddingCard}
                  />
                )}

              <Stack
                flex={1}
                p={1}
                flexDirection={{ base: 'column', sm: 'row' }}
                alignItems={{ base: 'center', sm: 'flex-end' }}
                flexWrap='wrap'
                px={paddingCard}
                pt={[0, 1, 2]}
                pb={[2, 4]}
                my={1}
              >
                <SourceLogo
                  display={{ base: 'none', sm: 'flex' }}
                  sources={sources}
                  url={url}
                  flex={1}
                />
                <Flex
                  flex={{ base: 1, sm: 'unset' }}
                  mt={[2, 0]}
                  w={{ base: '100%', sm: 'unset' }}
                >
                  {id && (
                    <NextLink
                      // referrerPath is the current path of the page - used for breadcrumbs in resources page
                      href={{
                        pathname: '/resources/',
                        query: { id, referrerPath },
                      }}
                      as={`/resources?id=${id}`}
                      style={{ flex: 1 }}
                      passHref
                      prefetch={false}
                    >
                      <Flex
                        flex={1}
                        justifyContent='flex-end'
                        flexWrap='wrap'
                        maxW={{ base: '100%', sm: '150px' }}
                      >
                        <Button
                          as='span'
                          flex={1}
                          size={{ base: 'md', sm: 'sm' }}
                          rightIcon={<FaCircleArrowRight />}
                          aria-label={`Go to details about resource ${name}`}
                        >
                          View resource
                        </Button>
                      </Flex>
                    </NextLink>
                  )}
                </Flex>
              </Stack>
            </CardBody>
          </>
        )}
      </Skeleton>
    </Card>
  );
};

export default SearchResultCard;
