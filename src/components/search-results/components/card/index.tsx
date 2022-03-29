import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Divider,
  Flex,
  FlexProps,
  HStack,
  Heading,
  Icon,
  Link,
  ListItem,
  Skeleton,
  Stat,
  StatLabel,
  Text,
  ToggleContainer,
  UnorderedList,
} from 'nde-design-system';
import {
  FaArrowAltCircleRight,
  FaClock,
  FaLockOpen,
  FaLock,
  FaMinus,
  FaPlus,
  FaChevronRight,
} from 'react-icons/fa';
import styled from '@emotion/styled';
import {FormattedResource} from 'src/utils/api/types';
import {
  formatAuthorsList2String,
  formatDate,
  formatDOI,
  getRepositoryImage,
  getRepositoryName,
} from 'src/utils/helpers';
import {ExternalSourceButton} from 'src/components/external-buttons/index.';

interface AccessBadgeProps {
  conditionsOfAccess?: 'restricted' | 'public' | 'controlled';
  children: React.ReactNode;
}

export const AccessBadge = (args: AccessBadgeProps) => {
  let colorScheme;
  let iconType;

  if (args.conditionsOfAccess === 'public') {
    colorScheme = 'success';
    iconType = FaLockOpen;
  }

  if (args.conditionsOfAccess === 'restricted') {
    colorScheme = 'negative';
    iconType = FaLock;
  }

  if (args.conditionsOfAccess === 'controlled') {
    colorScheme = 'warning';
    iconType = FaLock;
  }

  return (
    <Badge colorScheme={colorScheme} {...args}>
      {iconType && <Icon mr={2} as={iconType} />}
      {args.children}
    </Badge>
  );
};

const StyledLabel = styled(Flex)<FlexProps>`
  display: inline-flex;
  line-height: 1.5;
  position: relative;
  z-index: 9;
  &:before {
    content: '';
    background-color: ${(props: any) => props.theme.colors.status.info};
    box-shadow: 0 0 0 5px #fff;
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: skew(-12deg);
    width: 100%;
    z-index: -4;
  }
`;
StyledLabel.defaultProps = {
  mx: 2,
  p: 2,
};

interface StyledBannerProps extends FlexProps {
  name?: FormattedResource['type'];
}

export const StyledBanner: React.FC<StyledBannerProps> = ({
  name,
  children,
  pl,
  ...props
}) => {
  return (
    <Flex flexWrap={'wrap'} {...props}>
      <Flex
        bg={'status.info_lt'}
        pl={pl}
        py={0}
        overflow={'hidden'}
        w={['100%', 'unset']}
      >
        {name && (
          <StyledLabel>
            <Text
              fontSize={'xs'}
              color={'white'}
              px={2}
              fontWeight={'semibold'}
            >
              {name.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex
        bg={'status.info_lt'}
        py={1}
        overflow={'hidden'}
        w={['100%', 'unset']}
        flex={['unset', 1]}
        px={4}
      >
        {children}
      </Flex>
    </Flex>
  );
};

interface SearchResultCardProps {
  id?: FormattedResource['id'];
  name?: FormattedResource['name'];
  type?: FormattedResource['type'];
  date?: FormattedResource['date'];
  datePublished?: FormattedResource['datePublished'];
  author?: FormattedResource['author'];
  description?: FormattedResource['description'];
  license?: FormattedResource['license'];
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  measurementTechnique?: FormattedResource['measurementTechnique'];
  variableMeasured?: FormattedResource['variableMeasured'];
  doi?: FormattedResource['doi'];
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  isLoading?: boolean;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  isLoading,
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
  doi,
  includedInDataCatalog,
  ...props
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);
  const paddingCard = [4, 6, 8, 10];
  return (
    <Card variant={'colorful'}>
      {/* Card header where name of resource is a link to resource apge */}
      <CardHeader position={'relative'} px={paddingCard} pt={4}>
        {name && (
          <Link
            h={'100%'}
            href={`/resources/${id}`}
            flexWrap='nowrap'
            color='white'
            _hover={{
              color: 'white',
              h2: {textDecoration: 'underline'},
              svg: {
                transform: 'translate(0px)',
                opacity: 0.9,
                transition: '0.2s ease-in-out',
              },
            }}
            _visited={{color: 'white', svg: {color: 'white'}}}
          >
            <Flex alignItems='center'>
              <CardTitle size={'h6'} lineHeight='short' fontWeight='semibold'>
                {name}
              </CardTitle>
              <Icon
                as={FaChevronRight}
                boxSize={4}
                ml={4}
                opacity={0.6}
                transform='translate(-10px)'
                transition='0.2s ease-in-out'
              ></Icon>
            </Flex>
          </Link>
        )}
      </CardHeader>

      {/* Card Content */}
      {/* Author toggle container */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '150px' : 'unset'}
        p={0}
        m={isLoading ? 4 : 0}
      >
        <Flex flexDirection={['column', 'row']}>
          {author && (
            <ToggleContainer
              variant={'border'}
              ariaLabel={'Show all authors.'}
              noOfLines={1}
              justifyContent='start'
              m={0}
              px={paddingCard}
              py={2}
              flex={1}
              _focus={{outlineColor: 'transparent'}}
            >
              <Text fontSize={'xs'} color={'text.body'}>
                {formatAuthorsList2String(author, ',', 10)}
              </Text>
            </ToggleContainer>
          )}
          {conditionsOfAccess && (
            <Box
              d={['inline-flex', 'block']}
              justifyContent={['end']}
              alignContent='center'
              borderY={`1px solid`}
              borderColor={['transparent', 'gray.200']}
              m={1}
            >
              (
              <AccessBadge conditionsOfAccess={conditionsOfAccess}>
                Public
              </AccessBadge>
              )
            </Box>
          )}
        </Flex>

        {/* Banner with resource type + date of publication */}
        <StyledBanner name={type} pl={[2, 4, 6]}>
          {datePublished && (
            <Flex alignItems={'center'}>
              <Icon as={FaClock} mr={2}></Icon>
              <Text fontSize={'xs'} fontWeight={'semibold'}>
                Published on {formatDate(datePublished)}
              </Text>
            </Flex>
          )}
          {!datePublished && date && (
            <Flex alignItems={'center'}>
              <Icon as={FaClock} mr={2}></Icon>
              <Text fontSize={'xs'} fontWeight={'semibold'}>
                Published on {formatDate(date)}
              </Text>
            </Flex>
          )}
        </StyledBanner>
        {description && (
          <>
            <CardBody>
              <ToggleContainer
                ariaLabel={'show more description'}
                noOfLines={[3, 10]}
                px={paddingCard}
                py={[2, 4, 6]}
                my={0}
                borderColor={'transparent'}
                _focus={{outlineColor: 'transparent', bg: 'white'}}
              >
                <Box
                  w='100%'
                  fontSize={'sm'}
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                ></Box>
              </ToggleContainer>

              {doi && (
                <Flex
                  px={paddingCard}
                  py={1}
                  my={0}
                  flexDirection='column'
                  alignItems='end'
                >
                  <Text
                    fontSize='xs'
                    color='niaid.placeholder'
                    my={0}
                    fontWeight='medium'
                    lineHeight={1}
                  >
                    Altmetric
                  </Text>
                  <div
                    data-badge-popover='left'
                    data-badge-type='bar'
                    data-doi={`${formatDOI(doi)}`}
                    className='altmetric-embed'
                    data-link-target='blank'
                  ></div>
                </Flex>
              )}
            </CardBody>
          </>
        )}
        {license || measurementTechnique || variableMeasured ? (
          <Accordion allowToggle p={0} pt={1}>
            <AccordionItem>
              {({isExpanded}) => (
                <>
                  <h2>
                    <AccordionButton
                      px={paddingCard}
                      bg={isExpanded ? 'blackAlpha.100' : 'white'}
                    >
                      <Box flex='1' textAlign='left'>
                        <Heading fontSize={'h6'} fontWeight={'semibold'}>
                          Details
                        </Heading>
                      </Box>
                      {isExpanded ? (
                        <Icon as={FaMinus} fontSize='12px' />
                      ) : (
                        <Icon as={FaPlus} fontSize='12px' />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel w='100%' px={paddingCard}>
                    <UnorderedList ml={0}>
                      {license && (
                        <ListItem>
                          <Stat my={2}>
                            <StatLabel color={'gray.700'}>License</StatLabel>
                            <Link href={license} isExternal>
                              {license}
                            </Link>
                          </Stat>
                        </ListItem>
                      )}
                      {measurementTechnique && (
                        <ListItem>
                          <Stat my={2}>
                            <StatLabel color={'gray.700'}>
                              Measurement Technique
                            </StatLabel>
                            <Text fontWeight='semibold'>
                              {measurementTechnique}
                            </Text>
                          </Stat>
                        </ListItem>
                      )}
                      {variableMeasured && (
                        <ListItem>
                          <Stat my={2}>
                            <StatLabel color={'gray.700'}>
                              Variable Measured
                            </StatLabel>
                            <Text fontWeight='semibold'>
                              {variableMeasured}
                            </Text>
                          </Stat>
                        </ListItem>
                      )}
                    </UnorderedList>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
        ) : (
          <Divider p={0} />
        )}
      </Skeleton>
      <CardFooter
        justifyContent={'space-between'}
        alignItems={'center'}
        flexWrap='wrap'
        bg='white'
        px={paddingCard}
        py={2}
      >
        <HStack
          alignItems={'end'}
          justifyContent={'space-between'}
          py={1}
          w='100%'
          flexDirection={'row'}
        >
          {includedInDataCatalog?.name && (
            <Flex
              flexDirection={['column', 'row']}
              alignItems='center'
              flexWrap={'wrap'}
            >
              <ExternalSourceButton
                px={3}
                minW={'150px'}
                imageURL={imageURL || undefined}
                alt='Data source name'
                name={
                  getRepositoryName(includedInDataCatalog.name) || undefined
                }
                href={includedInDataCatalog?.url || undefined}
              ></ExternalSourceButton>
            </Flex>
          )}

          {id && (
            <Flex flex={1} justifyContent='end'>
              <Button
                my={1}
                href={`/resources/${id}`}
                size='md'
                rightIcon={<FaArrowAltCircleRight />}
              >
                See more
              </Button>
            </Flex>
          )}
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default SearchResultCard;
