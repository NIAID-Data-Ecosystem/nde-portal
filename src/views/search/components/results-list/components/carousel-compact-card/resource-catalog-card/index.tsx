import { Button, Flex, Skeleton, Text } from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { MetadataLabel } from 'src/components/metadata';
import { SearchableItems } from 'src/components/searchable-items';
import { Tooltip } from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';

import { CompactCard } from '../compact-card';

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

        {/* Date and badges */}
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
              content='Corresponds to the most recent of date modified, date published and date created.'
              showArrow
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
      </CompactCard.Header>

      <CompactCard.Body>
        {/* Content types */}
        {aboutItems.length > 0 && (
          <Flex bg='white' direction='column'>
            <MetadataLabel label='Content Types' mx={0} />
            <SearchableItems.Wrapper overflow='auto' maxHeight='200px'>
              <SearchableItems.List
                items={aboutItems}
                itemLimit={2}
                isExpanded={showAllTypes}
                onToggle={handleTypesToggle}
                generateButtonLabel={(limit, length) =>
                  limit === length
                    ? 'Show fewer types'
                    : `Show more types (${length - limit} more)`
                }
              />
            </SearchableItems.Wrapper>
          </Flex>
        )}

        {/* Description */}
        <Skeleton loading={isLoading} flex='1' mt={2} mb={1}>
          {description && (
            <>
              {shouldShowDescription ? (
                <Text fontSize='xs' lineHeight='short' lineClamp={3}>
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
