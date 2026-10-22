import { Button, Card, Flex, Skeleton, Text } from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import {
  ConditionsOfAccess,
  CreativeWorkStatus,
  HasAPI,
} from 'src/components/badges';
import { MetadataLabel } from 'src/components/metadata';
import { getProgramResourceVariant } from 'src/components/resource-sections/components/type-banner';
import { SearchableItems } from 'src/components/searchable-items';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_RETIRED_RESOURCE_CATALOG_UI } from 'src/utils/feature-flags';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { isSourceFundedByNiaid } from 'src/utils/helpers/sources';
import { getResourceCatalogContentTypeItems } from 'src/views/search/components/results-list/components/card/helpers';

import Tooltip from '../../../../../../../components/tooltip';
import { CompactCard } from '../compact-card';

interface ResourceCatalogCardProps {
  data?: FormattedResource | null;
  referrerPath?: string;
  loading?: boolean;
}

export const ResourceCatalogCard = ({
  data,
  referrerPath,
  loading = false,
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
    creativeWorkStatus,
    description,
  } = data || {};

  // ResourceCatalogs with a sourceOrganization are displayed as
  // "Program Resource" or "Program Info and Resource" with cyan banner
  // styling instead of the default ResourceCatalog treatment.
  const programVariant = getProgramResourceVariant(data ?? undefined);

  const handleTypesToggle = (expanded: boolean) => {
    setShowAllTypes(expanded);
  };

  const handleShowDescription = () => {
    setShowAllTypes(false);
  };

  // Transform about array to string array for SearchableItems
  const aboutItems = useMemo(
    () => getResourceCatalogContentTypeItems(data),
    [data],
  );

  const shouldShowDescription = !showAllTypes;

  // Retired ResourceCatalog cards use a gray treatment throughout to
  // visually communicate that the resource is no longer active. Gated
  // behind SHOW_RETIRED_RESOURCE_CATALOG_UI until approved for production.
  const isRetired =
    SHOW_RETIRED_RESOURCE_CATALOG_UI &&
    type === 'ResourceCatalog' &&
    creativeWorkStatus === 'Retired';

  const cardBg = 'white';

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
    <CompactCard.Base loading={loading} bg={cardBg}>
      <CompactCard.Banner
        label={formatAPIResourceTypeForDisplay(type || 'ResourceCatalog')}
        type={type || 'ResourceCatalog'}
        isNiaidFunded={isSourceFundedByNiaid(includedInDataCatalog)}
        loading={loading}
        creativeWorkStatus={creativeWorkStatus}
        programVariant={programVariant}
      />
      <CompactCard.Header loading={loading}>
        {name && (
          <CompactCard.Title linkProps={linkProps}>
            {name || ''}
          </CompactCard.Title>
        )}
      </CompactCard.Header>
      <CompactCard.Body>
        {/* Date and badges */}
        <Skeleton loading={loading}>
          {date && (
            <Flex whiteSpace='nowrap' alignItems='flex-start' gap={1}>
              <Tooltip content='Corresponds to the most recent of date modified, date published and date created.'>
                <Text fontSize='xs' fontWeight='medium'>
                  {date}
                </Text>
              </Tooltip>
              {(conditionsOfAccess ||
                hasAPI ||
                creativeWorkStatus === 'Retired') && (
                <Flex flexWrap='wrap' gap={1}>
                  <ConditionsOfAccess
                    type={data?.['@type']}
                    conditionsOfAccess={conditionsOfAccess}
                    mx={0.5}
                    size='sm'
                    {...(isRetired && {
                      colorPalette: 'gray',
                      color: 'gray.900',
                    })}
                  />
                  {hasAPI && (
                    <HasAPI
                      type={data?.['@type']}
                      hasAPI={data?.hasAPI}
                      mx={0.5}
                      size='sm'
                      {...(isRetired && {
                        colorPalette: 'gray',
                        color: 'gray.900',
                      })}
                    />
                  )}
                  <CreativeWorkStatus
                    creativeWorkStatus={creativeWorkStatus}
                    type={data?.['@type']}
                    mx={0.5}
                    size='sm'
                  />
                </Flex>
              )}
            </Flex>
          )}
        </Skeleton>

        {/* Content types */}
        <Skeleton loading={loading} px={-1}>
          {aboutItems.length > 0 && (
            <Flex bg={cardBg} flexDirection='column' gap='1'>
              <Text
                fontSize='xs'
                fontWeight='medium'
                textTransform='uppercase'
                color='inherit'
              >
                Content Types
              </Text>
              <SearchableItems
                size='xs'
                items={aboutItems}
                itemLimit={2}
                colorPalette={isRetired ? 'gray' : 'primary'}
                tagColor={isRetired ? 'gray.900' : undefined}
                linkColor={isRetired ? 'gray.900' : undefined}
                isExpanded={showAllTypes}
                onToggle={handleTypesToggle}
                generateButtonLabel={(limit, length) =>
                  limit === length
                    ? 'Show fewer types'
                    : `Show more types (${length - limit} more)`
                }
              />
            </Flex>
          )}
        </Skeleton>

        {/* Description */}
        <Skeleton loading={loading} flex='1'>
          {description && (
            <>
              {shouldShowDescription ? (
                <Card.Description lineClamp={3}>
                  {description.trim()}
                </Card.Description>
              ) : (
                <Button
                  colorPalette={isRetired ? 'gray' : 'primary'}
                  variant='unstyled'
                  underline
                  size='xs'
                  onClick={handleShowDescription}
                  alignSelf='flex-start'
                  {...(isRetired && { color: 'gray.900' })}
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
