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
import { FormattedResource } from 'src/utils/api/types';
import { TypeBanner } from 'src/components/resource-sections/components';
import { DisplayHTMLContent } from 'src/components/html-content';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { MetadataLabel } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';
import { SearchableItems } from 'src/components/searchable-items';
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

  const handleTypesToggle = (expanded: boolean) => {
    setShowAllTypes(expanded);
  };

  const handleShowDescription = () => {
    setShowAllTypes(false);
  };

  // Transform about array to string array for SearchableItems
  const aboutItems = about?.map(item => item.displayName) || [];

  // Determine what to show in the description area
  const shouldShowDescription = !showAllTypes;
  const shouldShowSeeDescriptionButton = showAllTypes && description;

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
        {/* Date and badges */}
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

        {/* Content types */}
        <Skeleton isLoaded={!isLoading} px={1} mt={0} mb={0}>
          {aboutItems.length > 0 && (
            <Flex bg='white' direction='column'>
              <MetadataLabel label='Content Types' />
              <ScrollContainer overflow='auto' maxHeight='200px'>
                <SearchableItems
                  fieldName='about'
                  items={aboutItems}
                  itemLimit={2}
                  colorScheme='primary'
                  isExpanded={showAllTypes}
                  onToggle={handleTypesToggle}
                  generateButtonLabel={(limit, length) =>
                    limit === length
                      ? 'Show fewer types'
                      : `Show more types (${length - limit} more)`
                  }
                />
              </ScrollContainer>
            </Flex>
          )}
        </Skeleton>

        {/* Description */}
        <Skeleton isLoaded={!isLoading} flex='1' px={2} mt={2} mb={1}>
          {description && (
            <>
              {shouldShowDescription && (
                <Text fontSize='xs' lineHeight='short' noOfLines={3}>
                  {description.trim()}
                </Text>
              )}
              {shouldShowSeeDescriptionButton && (
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
