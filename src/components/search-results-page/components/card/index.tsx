import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Flex,
  Icon,
  Skeleton,
  Text,
  ToggleContainer,
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
  isSourceFundedByNiaid,
} from 'src/utils/helpers';
import { TypeBanner } from 'src/components/resource-sections/components';
import NextLink from 'next/link';
import MetadataAccordion from './metadata-accordion';
import { DisplayHTMLContent } from 'src/components/html-content';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { SourceLogo } from './source-logo';
import { CompletenessBadgeCircle } from 'src/components/completeness-badge/Circular';

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
    includedInDataCatalog,
    isAccessibleForFree,
    url,
    sdPublisher,
  } = data || {};

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

          <Stack
            px={paddingCard}
            py={[0, 2]}
            my={2}
            flexDirection={{ base: 'column', sm: 'row' }}
            spacing={[1, 3, 4, 5]}
          >
            <Flex
              px={2}
              py={{ base: 1, sm: 3 }}
              flexDirection={{ base: 'row', sm: 'column' }}
              alignItems='center'
              border={{ base: '1px', sm: 'none' }}
              borderColor='gray.100'
              borderRadius='semi'
            >
              {data && (
                <>
                  <CompletenessBadgeCircle
                    stats={data['_meta']}
                    animate={false}
                    size='md'
                  />

                  {/* label for mobile */}
                  <Text
                    display={{ base: 'block', sm: 'none' }}
                    color='gray.800'
                    fontSize='xs'
                    fontWeight='normal'
                    lineHeight='shorter'
                    mx={3}
                  >
                    Metadata Completeness
                  </Text>
                </>
              )}
            </Flex>
            {/* display source here on mobile. */}
            <Flex
              display={{ base: 'block', sm: 'none' }}
              px={2}
              py={{ base: 1, sm: 3 }}
              flexDirection={{ base: 'row', sm: 'column' }}
              alignItems='center'
              border={{ base: '1px', sm: 'none' }}
              borderColor='gray.100'
              borderRadius='semi'
            >
              <SourceLogo
                isLoading={isLoading}
                sdPublisher={sdPublisher}
                includedInDataCatalog={includedInDataCatalog}
                url={url}
              />
            </Flex>

            <Flex flexDirection='column' flex={1}>
              {/* Description Text */}
              {description && (
                <ToggleContainer
                  ariaLabel='show more description'
                  noOfLines={[3, 10]}
                  px={1}
                  py={1}
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
              <Stack
                flex={1}
                p={1}
                flexDirection={{ base: 'column', sm: 'row' }}
                alignItems={{ base: 'center', sm: 'flex-end' }}
                flexWrap={'wrap'}
              >
                <SourceLogo
                  display={{ base: 'none', sm: 'flex' }}
                  isLoading={isLoading}
                  sdPublisher={sdPublisher}
                  includedInDataCatalog={includedInDataCatalog}
                  url={url}
                  flex={1}
                />
                <Flex flex={[1, 'unset']} mt={[2, 0]}>
                  {id && (
                    <NextLink
                      href={{
                        pathname: '/resources/',
                        query: { id },
                      }}
                      style={{ flex: 1 }}
                      passHref
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
                          rightIcon={<FaArrowAltCircleRight />}
                          aria-label={`Go to details about resource ${name}`}
                        >
                          View dataset
                        </Button>
                      </Flex>
                    </NextLink>
                  )}
                </Flex>
              </Stack>
            </Flex>
          </Stack>
          <MetadataAccordion data={data} />
        </CardBody>
      </Skeleton>
    </Card>
  );
};

export default SearchResultCard;
