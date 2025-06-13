import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Tooltip,
  Text,
  Button,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { MetadataLabel } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';
import { Skeleton } from 'src/components/skeleton';

interface CompactCardProps {
  data?: FormattedResource | null;
  referrerPath?: string;
  isLoading?: boolean;
}

export const CompactCard = ({
  data,
  referrerPath,
  isLoading = false,
}: CompactCardProps) => {
  const [showDescription, setShowDescription] = useState(true);
  const [showAllTypes, setShowAllTypes] = useState(false);

  const {
    ['@type']: type,
    id,
    alternateName,
    name,
    includedInDataCatalog,
    date,
    conditionsOfAccess,
    hasAPI,
    about,
    description,
  } = data || {};

  const handleShowMoreTypes = () => {
    setShowAllTypes(true);
    setShowDescription(false);
  };

  const handleShowFewerTypes = () => {
    setShowAllTypes(false);
    setShowDescription(true);
  };

  const handleShowDescription = () => {
    setShowDescription(true);
    setShowAllTypes(false);
  };

  const handleHideDescription = () => {
    setShowDescription(false);
    setShowAllTypes(true);
  };

  return (
    <Card
      variant='niaid'
      boxShadow='none'
      border='1px solid'
      borderColor='gray.200'
      height={{
        base: '325px',
        sm: '295px',
        md: '320px',
        lg: '320px',
        xl: '325px',
      }}
    >
      {/* TypeBanner */}
      <Skeleton
        isLoaded={!isLoading}
        height={isLoading ? '40px' : 'auto'}
        borderTopRadius='md'
      >
        <TypeBanner
          type={type || 'ResourceCatalog'}
          p={0}
          pl={[2, 4, 6]}
          flexDirection={['column', 'row']}
          isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
        />
      </Skeleton>
      <CardHeader
        bg='transparent'
        position='relative'
        px={2}
        pt={1}
        pb={1}
        w='100%'
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
      >
        {/* Title */}
        <Skeleton isLoaded={!isLoading} minHeight='27px' flex={1}>
          <NextLink
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
              fontSize='md'
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
            />
          </NextLink>
        </Skeleton>
      </CardHeader>
      <CardBody p={0}>
        {/* Date and badges section */}
        <Skeleton isLoaded={!isLoading} minHeight='30px' px={2} m={0}>
          {date && (
            <Flex
              bg='white'
              fontWeight='semibold'
              whiteSpace='nowrap'
              alignItems='flex-start'
              justify='space-between'
            >
              <Tooltip
                label='Corresponds to the most recent of date modified, date published and date created.'
                hasArrow
                bg='#fff'
                sx={{
                  color: 'text.body',
                }}
              >
                <Text fontSize='13px'>{date}</Text>
              </Tooltip>
              {(conditionsOfAccess || hasAPI === true) && (
                <Flex
                  justifyContent={['flex-start']}
                  alignItems='center'
                  w={['100%', 'unset']}
                  flex={[1]}
                  p={[0.5, 0.5]}
                  flexWrap='wrap'
                  ml={0.5}
                  gap={0.5}
                >
                  <ConditionsOfAccess
                    type={data?.['@type']}
                    conditionsOfAccess={conditionsOfAccess}
                    mx={0.5}
                    size='sm'
                  />
                  {hasAPI === true && (
                    <HasAPI
                      type={data?.['@type']}
                      hasAPI={data?.hasAPI}
                      mx={0.5}
                      size='sm'
                    />
                  )}
                </Flex>
              )}
            </Flex>
          )}
        </Skeleton>

        {/* Content types section */}
        <Skeleton isLoaded={!isLoading} px={1} mt={0} mb={0}>
          {about && (
            <Flex bg='white' direction='column'>
              <MetadataLabel label='Content Types' />
              <ScrollContainer overflow='auto' maxHeight='200px'>
                <ScrollContainer
                  maxHeight='300px'
                  m={0}
                  p={0}
                  display='flex'
                  flexWrap='wrap'
                >
                  {about.slice(0, showAllTypes ? about.length : 2).map(item => (
                    <TagWithUrl
                      key={item.displayName}
                      colorScheme='primary'
                      href={{
                        pathname: '/search',
                        query: {
                          q: `about:"${item.displayName.trim().toLowerCase()}"`,
                        },
                      }}
                      m={0.5}
                      leftIcon={FaMagnifyingGlass}
                    >
                      {item.displayName}
                    </TagWithUrl>
                  ))}
                  {about.length > 2 && (
                    <Button
                      colorScheme='primary'
                      size='xs'
                      variant='link'
                      justifyContent='flex-end'
                      m={1}
                      onClick={
                        showAllTypes
                          ? handleShowFewerTypes
                          : handleShowMoreTypes
                      }
                    >
                      {showAllTypes
                        ? 'Show fewer types'
                        : `Show more types (${about.length - 2} more)`}
                    </Button>
                  )}
                </ScrollContainer>
              </ScrollContainer>
            </Flex>
          )}
        </Skeleton>

        {/* Description section */}
        <Skeleton isLoaded={!isLoading} flex='1' px={2} mt={2} mb={1}>
          {description && (
            <>
              {showDescription ? (
                <Flex direction='column' gap={1}>
                  <Text fontSize='xs' lineHeight='short' noOfLines={3}>
                    {description.trim()}
                  </Text>
                  <Button
                    variant='link'
                    size='xs'
                    onClick={handleHideDescription}
                    alignSelf='flex-start'
                    p={0}
                    minH='auto'
                    height='auto'
                    fontSize='xs'
                  >
                    Hide description
                  </Button>
                </Flex>
              ) : (
                <Button
                  variant='link'
                  size='xs'
                  onClick={handleShowDescription}
                  alignSelf='flex-start'
                  p={0}
                  minH='auto'
                  height='auto'
                  fontSize='xs'
                >
                  See description
                </Button>
              )}
            </>
          )}
        </Skeleton>
      </CardBody>
    </Card>
  );
};
