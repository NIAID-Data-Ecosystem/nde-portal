import React from 'react';
import {
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
  BoxProps,
  Badge,
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
} from 'src/utils/helpers';
import {
  AccessBadge,
  TypeBanner,
} from 'src/components/resource-sections/components';
import { assetPrefix } from 'next.config';
import NextLink from 'next/link';
import CardDetails from './details';
import { DisplayHTMLContent } from 'src/components/html-content';

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
    name,
    type,
    date,
    author,
    description,
    conditionsOfAccess,
    doi,
    pmid,
    nctid,
    includedInDataCatalog,
    isAvailableForFree,
    url,
    sdPublisher,
  } = data || {};

  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);
  const paddingCard = [4, 6, 8, 10];

  const ConditionsOfAccess = (props: BoxProps) => {
    if (!conditionsOfAccess && !isAvailableForFree) {
      return null;
    }
    return (
      <Flex
        justifyContent={['flex-end']}
        alignItems='center'
        w={['100%', 'unset']}
        flex={[1, 'unset']}
        p={[0.5, 2]}
        {...props}
      >
        {isAvailableForFree && (
          <Badge mr={2} colorScheme={isAvailableForFree ? 'success' : 'gray'}>
            Free Access
          </Badge>
        )}
        {conditionsOfAccess && (
          <AccessBadge
            w={['100%', 'unset']}
            conditionsOfAccess={conditionsOfAccess}
          >
            {conditionsOfAccess}
          </AccessBadge>
        )}
      </Flex>
    );
  };

  return (
    <>
      {/* Banner with resource type + date of publication */}
      <Card variant='colorful'>
        <TypeBanner
          type={type}
          p={0}
          pl={[2, 4, 6]}
          flexDirection={['column', 'row']}
          bg='niaid.color'
        ></TypeBanner>
        {/* Card header where name of resource is a link to resource apge */}

        <CardHeader bg='white' position='relative' px={paddingCard} pt={4}>
          <Skeleton
            isLoaded={!isLoading}
            startColor='whiteAlpha.100'
            endColor='whiteAlpha.500'
            h={isLoading ? '20px' : 'unset'}
            w='100%'
          >
            {name && (
              <NextLink
                href={{
                  pathname: '/resources/',
                  query: { id },
                }}
                passHref
              >
                <Link
                  h={'100%'}
                  flexWrap='nowrap'
                  display={'inline-block'}
                  sx={{ h2: { textDecoration: 'underline' } }}
                  _hover={{
                    h2: { textDecoration: 'none' },
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
                  <Flex alignItems='center'>
                    <CardTitle
                      size='h6'
                      lineHeight='short'
                      fontWeight='semibold'
                    >
                      {name}
                    </CardTitle>
                    <Icon
                      as={FaChevronRight}
                      boxSize={4}
                      ml={4}
                      opacity={0.6}
                      transform='translate(-5px)'
                      transition='0.2s ease-in-out'
                    ></Icon>
                  </Flex>
                </Link>
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
            <ConditionsOfAccess />
          </Flex>

          <>
            <CardBody>
              {date && (
                <Flex
                  px={paddingCard}
                  m={0}
                  flex={1}
                  borderRadius='semi'
                  bg='secondary.50'
                  fontWeight={'semibold'}
                >
                  <Flex whiteSpace='nowrap' alignItems='center'>
                    <Icon as={FaRegClock} mr={2} />
                    <Text fontSize='xs'>{date}</Text>
                  </Flex>
                </Flex>
              )}
              {/* Description Text */}
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

              <CardDetails data={data} />
              {/* Source Repository Link + Altmetric badge */}
              {(doi || includedInDataCatalog?.name) && (
                <Flex
                  px={paddingCard}
                  py={{ base: 2, md: 4 }}
                  my={0}
                  flexDirection='row'
                  flexWrap={['wrap', 'nowrap', 'nowrap']}
                  alignItems='flex-end'
                >
                  {/* Source repository */}
                  {(includedInDataCatalog?.name || sdPublisher?.name) && (
                    <Flex
                      minW={['250px']}
                      maxW={['unset', '50%', 'unset']}
                      alignItems='center'
                      flexWrap='wrap'
                      my={[4, 4, 0]}
                    >
                      {imageURL ? (
                        includedInDataCatalog.url ? (
                          <Link
                            target='_blank'
                            href={includedInDataCatalog.url}
                            mb={[2, 2, 0]}
                          >
                            <Image
                              minH='40px'
                              maxH='40px'
                              maxW='200px'
                              mr={4}
                              src={`${assetPrefix}${imageURL}`}
                              alt='Data source name'
                            ></Image>
                          </Link>
                        ) : (
                          <Image
                            minH='20px'
                            maxH='40px'
                            maxW='200px'
                            mr={4}
                            mb={[2, 2, 0]}
                            src={`${assetPrefix}${imageURL}`}
                            alt='Data source name'
                          ></Image>
                        )
                      ) : (
                        <></>
                      )}
                      <Flex flexDirection='column'>
                        {includedInDataCatalog?.name && (
                          <>
                            {url || includedInDataCatalog.url ? (
                              <Link
                                href={url! || includedInDataCatalog.url!}
                                isExternal
                              >
                                <Text fontSize='xs'>
                                  Provided by {includedInDataCatalog.name}
                                </Text>
                              </Link>
                            ) : (
                              <Text fontSize='xs'>
                                Provided by {includedInDataCatalog.name}
                              </Text>
                            )}
                          </>
                        )}

                        {/* original source */}
                        {sdPublisher?.url ? (
                          <Link href={sdPublisher.url} isExternal>
                            <Text fontSize='xs' as='i'>
                              Original source {sdPublisher.name}
                            </Text>
                          </Link>
                        ) : sdPublisher?.name ? (
                          <Text fontSize='xs' as='i'>
                            Original source {sdPublisher.name}
                          </Text>
                        ) : (
                          <></>
                        )}
                      </Flex>
                    </Flex>
                  )}
                  {doi && (
                    <Flex
                      flex={1}
                      mt={[4, 4, 0]}
                      // minW='200px'
                      flexDirection='column'
                      alignItems={['flex-start', 'flex-end']}
                    >
                      <Text
                        fontSize='xs'
                        my={0}
                        fontWeight='medium'
                        lineHeight={1}
                      >
                        Altmetric
                      </Text>
                      {/* Altmetric embed badges don't allow for adding aria-label so VisuallyHidden is a patch */}
                      <VisuallyHidden>
                        See more information about resource on Altmetric
                      </VisuallyHidden>
                      <div
                        role='link'
                        aria-label={`altmetric badge for doi ${doi}`}
                        data-badge-popover='left'
                        data-badge-type='bar'
                        data-doi={formatDOI(doi)}
                        data-nct-id={nctid}
                        data-pmid={pmid}
                        className='altmetric-embed'
                        data-link-target='blank'
                      ></div>
                    </Flex>
                  )}
                </Flex>
              )}
            </CardBody>
          </>
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
            justifyContent='space-between'
            alignItems='center'
            flexWrap='wrap'
            bg='page.alt'
            px={paddingCard}
            py={2}
          >
            {id && (
              <Flex w='100%' justifyContent='flex-end'>
                <NextLink
                  href={{
                    pathname: '/resources/',
                    query: { id },
                  }}
                  passHref
                >
                  <Button
                    maxW={{ xl: '230px' }}
                    w='100%'
                    rightIcon={<FaArrowAltCircleRight />}
                    aria-label={`Go to details about resource ${name}`}
                  >
                    See more
                    <VisuallyHidden> details about the dataset</VisuallyHidden>
                  </Button>
                </NextLink>
              </Flex>
            )}
          </CardFooter>
        </Skeleton>
      </Card>
    </>
  );
};

export default SearchResultCard;
