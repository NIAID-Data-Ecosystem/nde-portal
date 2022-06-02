import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  ListItem,
  Skeleton,
  Text,
  ToggleContainer,
  UnorderedList,
  VisuallyHidden,
  BoxProps,
  SimpleGrid,
} from 'nde-design-system';
import {
  FaArrowAltCircleRight,
  FaMinus,
  FaPlus,
  FaChevronRight,
  FaRegClock,
} from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import {
  formatAuthorsList2String,
  formatDOI,
  formatLicense,
  getRepositoryImage,
} from 'src/utils/helpers';
import {
  AccessBadge,
  TypeBanner,
} from 'src/components/resource-sections/components';
import { assetPrefix } from 'next.config';
import NextLink from 'next/link';
import Glyph from 'src/components/glyph';

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
    datePublished,
    author,
    description,
    license,
    conditionsOfAccess,
    measurementTechnique,
    variableMeasured,
    species,
    infectiousAgent,
    infectiousDisease,
    healthCondition,
    topic,
    doi,
    pmid,
    nctid,
    includedInDataCatalog,
    url,
  } = data || {};

  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);
  const paddingCard = [4, 6, 8, 10];
  const licenseInfo = license ? formatLicense(license) : null;

  const ConditionsOfAccess = (props: BoxProps) => {
    if (!conditionsOfAccess) {
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
        <AccessBadge
          w={['100%', 'unset']}
          conditionsOfAccess={conditionsOfAccess}
        >
          {conditionsOfAccess}
        </AccessBadge>
      </Flex>
    );
  };

  interface StyledStatProps extends BoxProps {
    label: string;
    glyph?: string;
  }
  const StyledStat: React.FC<StyledStatProps> = ({
    label,
    children,
    glyph,
    ...props
  }) => {
    return (
      <Box
        p={0}
        border='0.625px solid'
        borderRadius='semi'
        overflow='hidden'
        borderColor={!children ? 'gray.100' : 'secondary.500'}
        {...props}
      >
        <Flex
          alignItems='center'
          pb={0}
          bg={!children ? 'gray.50' : 'secondary.50'}
        >
          <Icon
            viewBox='0 0 200 200'
            color='page.alt'
            fill={!children ? 'gray.400' : 'gray.800'}
            m={2}
            opacity={children ? 1 : 0.6}
            // boxSize={8}
          >
            <Glyph glyph={glyph} stroke='currentColor' />
          </Icon>
          <Text
            color='text.body'
            fontSize='sm'
            fontWeight='medium'
            opacity={children ? 1 : 0.9}
          >
            {label} :
          </Text>
        </Flex>
        <Box
          m={2}
          mt={0}
          p={2}
          borderTop='0.625px solid'
          borderColor='gray.100'
          opacity={children ? 1 : 0.4}
          color={'text.heading'}
          fontSize='md'
        >
          {children || (
            <Box w='100%' h='1rem'>
              --
              <VisuallyHidden>No data available.</VisuallyHidden>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  console.log('D', data);
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
                <Box
                  w='100%'
                  fontSize='sm'
                  flex={1}
                  sx={{ pre: { display: 'none' } }}
                  style={{ whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{
                    __html: description?.replace(/\u00a0/g, ' ') || '',
                  }}
                ></Box>
              </ToggleContainer>

              {/* Details expandable drawer */}
              <Accordion allowToggle p={0} pt={1} my={0}>
                <AccordionItem>
                  {({ isExpanded }) => (
                    <>
                      <h2>
                        <AccordionButton
                          px={paddingCard}
                          // bg={isExpanded ? 'page.alt' : 'white'}
                          _hover={{ bg: 'page.alt' }}
                          aria-label={`show more details about dataset id ${id}`}
                        >
                          <Box flex='1' textAlign='left'>
                            <Heading fontSize='h6' fontWeight='semibold'>
                              Details
                            </Heading>
                          </Box>
                          <Icon
                            as={isExpanded ? FaMinus : FaPlus}
                            fontSize='xs'
                          />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel w='100%' px={paddingCard} my={2}>
                        <SimpleGrid minChildWidth={'300px'} spacing='10px'>
                          {/* License*/}
                          <StyledStat label='License'>
                            {licenseInfo && (
                              <>
                                {licenseInfo?.img && (
                                  <Image
                                    src={`${assetPrefix}${licenseInfo.img}`}
                                    alt={licenseInfo.type}
                                    mb={1}
                                  />
                                )}
                                {licenseInfo?.url ? (
                                  <Link href={licenseInfo.url} isExternal>
                                    {licenseInfo.title}
                                  </Link>
                                ) : (
                                  licenseInfo?.title
                                )}
                              </>
                            )}
                          </StyledStat>
                          {/* Topic */}
                          <StyledStat label='Topics'>
                            {Array.isArray(topic) ? topic.join(', ') : topic}
                          </StyledStat>

                          {/* Measurement techniques*/}
                          <StyledStat label='Measurement Technique'>
                            {measurementTechnique && (
                              <UnorderedList ml={0}>
                                {measurementTechnique.map((m, i) => {
                                  const name = Array.isArray(m.name)
                                    ? m.name.join(', ')
                                    : m.name;

                                  const MeasurementTechniqueLabel = () => (
                                    <Text color='inherit'>{name}</Text>
                                  );

                                  return (
                                    <ListItem key={`${name}-${i}`}>
                                      {m.url ? (
                                        <Link href={m.url} isExternal>
                                          <MeasurementTechniqueLabel />
                                        </Link>
                                      ) : (
                                        <MeasurementTechniqueLabel />
                                      )}
                                    </ListItem>
                                  );
                                })}
                              </UnorderedList>
                            )}
                          </StyledStat>

                          {/* Variable Measured */}
                          <StyledStat label='Variable Measured'>
                            {variableMeasured && (
                              <Text color='inherit'>variableMeasured</Text>
                            )}
                          </StyledStat>

                          {/* Infectious Agent*/}
                          <StyledStat label='Infectious Agent'>
                            {infectiousAgent && (
                              <UnorderedList ml={0}>
                                {infectiousAgent.map((m, i) => {
                                  const name = Array.isArray(m.name)
                                    ? m.name.join(', ')
                                    : m.name;

                                  return (
                                    <ListItem key={`${name}-${i}`}>
                                      {m.url ? (
                                        <Link href={m.url} isExternal>
                                          {name}
                                        </Link>
                                      ) : (
                                        name
                                      )}
                                    </ListItem>
                                  );
                                })}
                              </UnorderedList>
                            )}
                          </StyledStat>

                          {/* Infectious Disease*/}
                          <StyledStat label='Infectious Disease'>
                            {(infectiousDisease || healthCondition) && (
                              <>
                                <UnorderedList ml={0}>
                                  {healthCondition && (
                                    <ListItem>{healthCondition}</ListItem>
                                  )}
                                  {infectiousDisease?.map((m, i) => {
                                    const name = Array.isArray(m.name)
                                      ? m.name.join(', ')
                                      : m.name;

                                    return (
                                      <ListItem key={`${name}-${i}`}>
                                        {m.url ? (
                                          <Link href={m.url} isExternal>
                                            {name}
                                          </Link>
                                        ) : (
                                          name
                                        )}
                                      </ListItem>
                                    );
                                  })}
                                </UnorderedList>
                              </>
                            )}
                          </StyledStat>

                          {/* Species*/}
                          <StyledStat label='Species'>
                            {species && (
                              <Text color='inherit'>
                                {species.map((m, i) => {
                                  const name = Array.isArray(m.name)
                                    ? m.name.join(', ')
                                    : m.name;

                                  return (
                                    <React.Fragment key={`${name}-${i}`}>
                                      {m.url ? (
                                        <Link href={m.url} isExternal>
                                          {name}
                                        </Link>
                                      ) : (
                                        name
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </Text>
                            )}
                          </StyledStat>
                        </SimpleGrid>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
              {/* Source Repository Link + Altmetric badge */}
              {(doi || includedInDataCatalog?.name) && (
                <Flex
                  px={paddingCard}
                  py={{ base: 2, md: 4 }}
                  my={0}
                  flexDirection='row'
                  flexWrap='wrap'
                  alignItems='flex-end'
                >
                  {includedInDataCatalog?.name && (
                    <Flex minW={['250px']} alignItems='flex-end'>
                      {imageURL &&
                        (includedInDataCatalog.url ? (
                          <Link
                            target='_blank'
                            href={includedInDataCatalog.url}
                          >
                            <Image
                              h='40px'
                              mr={4}
                              src={`${assetPrefix}${imageURL}`}
                              alt='Data source name'
                            ></Image>
                          </Link>
                        ) : (
                          <Image
                            h='40px'
                            mr={4}
                            src={`${assetPrefix}${imageURL}`}
                            alt='Data source name'
                          ></Image>
                        ))}
                      {url || includedInDataCatalog.url ? (
                        <Link
                          href={url! || includedInDataCatalog.url!}
                          isExternal
                        >
                          <Text fontSize={'xs'}>
                            Provided by {includedInDataCatalog.name}
                          </Text>
                        </Link>
                      ) : (
                        <Text fontSize={'xs'}>
                          Provided by {includedInDataCatalog.name}
                        </Text>
                      )}
                    </Flex>
                  )}
                  {doi && (
                    <Flex
                      flex={1}
                      mt={[2, 2, 0]}
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
