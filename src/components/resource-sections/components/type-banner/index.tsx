import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa6';
import { FormattedResource, SourceOrganization } from 'src/utils/api/types';
import { StyledLabel } from './styles';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';
import Tooltip from 'src/components/tooltip';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SHOW_RETIRED_RESOURCE_CATALOG_UI } from 'src/utils/feature-flags';

export interface TypeBannerProps extends FlexProps {
  label: string;
  type?: APIResourceType | 'Disease';
  date?: FormattedResource['date'];
  sourceName?: string[] | null;
  isNiaidFunded?: boolean;
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  // True when this ResourceCatalog has a non-empty sourceOrganization.
  // Renders as "Program Resource" with cyan styling instead of the
  // default ResourceCatalog treatment.
  isProgramResource?: boolean;
}

// Determines whether a record's sourceOrganization should be treated as
// "present" for the Program Resource banner override (i.e. not null/undefined
// and, if an array, non-empty).
export const hasSourceOrganization = (
  sourceOrganization?: SourceOrganization[] | SourceOrganization | null,
): boolean => {
  if (sourceOrganization == null) return false;
  if (Array.isArray(sourceOrganization)) {
    return sourceOrganization.length > 0;
  }
  return true;
};

export const getTypeColor = (
  type?: APIResourceType | string,
  isRetired?: boolean,
  isProgramResource?: boolean,
) => {
  // Retired ResourceCatalogs use a gray treatment instead of the usual
  // per-type colors.
  if (isRetired) {
    return { lt: 'gray.800', dk: 'gray.300' };
  }

  // ResourceCatalogs with a sourceOrganization are displayed as
  // "Program Resource" and use a distinct cyan treatment.
  if (isProgramResource) {
    return { lt: 'cyan.900', dk: 'cyan.600' };
  }

  const typeLower = type?.toLowerCase();
  let lt = 'status.info';
  let dk = 'niaid.500';

  if (typeLower === 'dataset') {
    lt = 'status.info';
    dk = 'niaid.500';
  } else if (typeLower === 'resourcecatalog') {
    lt = 'primary.500';
    dk = 'primary.700';
  } else if (typeLower?.includes('tool') || typeLower?.includes('software')) {
    lt = 'primary.800';
  } else if (typeLower === 'disease') {
    lt = 'purple.600';
    dk = 'purple.800';
  } else {
    lt = 'niaid.500';
  }

  return { lt, dk };
};

const TypeBanner: React.FC<TypeBannerProps> = ({
  label,
  type,
  date,
  children,
  pl,
  isNiaidFunded,
  creativeWorkStatus,
  isProgramResource,
  ...props
}) => {
  // Retired ResourceCatalogs get the gray banner treatment; every other
  // type/status combination keeps its standard per-type colors. Gated
  // behind SHOW_RETIRED_RESOURCE_CATALOG_UI until approved for production.
  const isRetired =
    SHOW_RETIRED_RESOURCE_CATALOG_UI &&
    type === 'ResourceCatalog' &&
    creativeWorkStatus === 'Retired';

  const colorScheme = getTypeColor(type, isRetired, isProgramResource);

  const abstract = SCHEMA_DEFINITIONS['@type']?.['abstract'];
  const description = SCHEMA_DEFINITIONS['@type']?.['description'];

  const abstractTooltipLabel =
    abstract && type && type in abstract
      ? (abstract as Record<string, string>)[type]
      : '';

  const descriptionTooltipLabel =
    description && type && type in description
      ? (description as Record<string, string>)[type]
      : '';

  // ResourceCatalogs that have a sourceOrganization are labeled
  // "Program Resource" instead of the default type label.
  const displayLabel =
    isProgramResource && type === 'ResourceCatalog'
      ? 'Program Resource'
      : label;

  return (
    <Flex flexWrap='wrap' w='100%' bg={props.bg || colorScheme.dk} {...props}>
      <Flex
        bg={props.bg || colorScheme.dk}
        px={{ base: 2, lg: 4 }}
        pl={pl}
        py={0}
        overflow='hidden'
        minW='250px'
      >
        <StyledLabel
          _before={{
            bg: colorScheme.lt,
          }}
        >
          <Tooltip label={abstractTooltipLabel || descriptionTooltipLabel}>
            <Text
              fontSize='xs'
              color={type ? 'white' : colorScheme.lt}
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
              textTransform='uppercase'
            >
              {displayLabel || 'Unknown'}
            </Text>
          </Tooltip>
        </StyledLabel>

        {isNiaidFunded && (
          <StyledLabel
            _before={{
              bg: isRetired ? colorScheme.lt : colorScheme.dk,
            }}
          >
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
            >
              NIAID
            </Text>
          </StyledLabel>
        )}
      </Flex>

      <Flex
        bg={props.bg || colorScheme.dk}
        overflow='hidden'
        flex={1}
        minW='250px'
      >
        {date && (
          <Flex alignItems='center' px={{ base: 2, lg: 4 }} py={[2, 1]}>
            <Icon as={FaRegClock} mr={2} />
            <Text fontSize='xs' fontWeight='semibold' whiteSpace='nowrap'>
              {date}
            </Text>
          </Flex>
        )}
        {children}
      </Flex>
    </Flex>
  );
};

export default TypeBanner;
