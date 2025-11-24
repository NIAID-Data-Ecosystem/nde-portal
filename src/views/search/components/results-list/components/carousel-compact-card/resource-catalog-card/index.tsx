import React, { useMemo, useState } from 'react';
import { Flex, Tooltip, Text, Button } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { MetadataLabel } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';
import { SearchableItems } from 'src/components/searchable-items';
import { Skeleton } from 'src/components/skeleton';
import { CompactCard } from '../compact-card';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';

interface ResourceCatalogCardProps {
  data?: FormattedResource | null;
  referrerPath?: string;
  isLoading?: boolean;
}

export const ResourceCatalogCard = ({
  data,
  referrerPath,
  isLoading = false,
}: ResourceCatalogCardProps) => {
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
  const aboutItems = useMemo(
    () =>
      about?.map(a => ({
        name: a.displayName,
        value: a.displayName,
        field: 'about.displayName',
      })) || [],
    [about],
  );

  const shouldShowDescription = !showAllTypes;

  const linkProps = id
    ? {
        href: {
          pathname: '/resources/',
          query: { id, referrerPath },
        },
        as: `/resources?id=${id}`,
      }
    : undefined;

  return (
    <CompactCard.Base isLoading={isLoading}>
      <CompactCard.Banner
        label={formatAPIResourceTypeForDisplay(type || 'ResourceCatalog')}
        type={type || 'ResourceCatalog'}
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
        isLoading={isLoading}
      />

      <CompactCard.Header isLoading={isLoading}>
        {(name || alternateName) && (
          <CompactCard.Title linkProps={linkProps}>
            {name || alternateName || ''}
          </CompactCard.Title>
        )}
      </CompactCard.Header>

      <CompactCard.Body>
        {/* Date and badges */}
        <Skeleton isLoaded={!isLoading} minHeight='30px'>
          {date && (
            <Flex
              bg='white'
              fontWeight='semibold'
              whiteSpace='nowrap'
              alignItems='flex-start'
              justify='space-between'
              px={0}
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
              {(conditionsOfAccess || hasAPI) && (
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
                  {hasAPI && (
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
        <Skeleton isLoaded={!isLoading} px={-1}>
          {aboutItems.length > 0 && (
            <Flex bg='white' direction='column'>
              <MetadataLabel label='Content Types' />
              <ScrollContainer overflow='auto' maxHeight='200px'>
                <SearchableItems
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
        <Skeleton isLoaded={!isLoading} flex='1' mt={2} mb={1}>
          {description && (
            <>
              {shouldShowDescription ? (
                <Text fontSize='xs' lineHeight='short' noOfLines={3}>
                  {description.trim()}
                </Text>
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
      </CompactCard.Body>
    </CompactCard.Base>
  );
};
