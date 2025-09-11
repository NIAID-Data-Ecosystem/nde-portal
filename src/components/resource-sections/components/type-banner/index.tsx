import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import { StyledLabel } from './styles';
import { formatResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import Tooltip from 'src/components/tooltip';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

interface TypeBannerProps extends FlexProps {
  type?: FormattedResource['@type'];
  date?: FormattedResource['date'];
  sourceName?: string[] | null;
  isNiaidFunded?: boolean;
}

export const getTypeColor = (type?: FormattedResource['@type']) => {
  const typeLower = type?.toLowerCase();
  let lt = 'info.default';
  let dk = 'niaid.500';

  if (typeLower === 'dataset') {
    lt = 'info.default';
    dk = 'niaid.500';
  } else if (typeLower === 'resourcecatalog') {
    lt = 'primary.500';
    dk = 'primary.700';
  } else if (typeLower?.includes('tool') || typeLower?.includes('software')) {
    lt = 'primary.800';
  } else {
    lt = 'niaid.500';
  }
  return { lt, dk };
};

const TypeBanner: React.FC<TypeBannerProps> = ({
  type,
  date,
  children,
  pl,
  isNiaidFunded,
  ...props
}) => {
  const colorScheme = getTypeColor(type);
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

  return (
    <Flex
      flexWrap='wrap'
      w='100%'
      bg={props.bg || colorScheme['dk']}
      {...props}
    >
      <Flex
        bg={props.bg || colorScheme['dk']}
        px={{ base: 2, lg: 4 }}
        pl={pl}
        py={0}
        overflow='hidden'
        minW='250px'
      >
        <StyledLabel
          _before={{
            bg: colorScheme['lt'],
          }}
        >
          <Tooltip label={abstractTooltipLabel || descriptionTooltipLabel}>
            <Text
              fontSize='xs'
              color={type ? 'white' : colorScheme['lt']}
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
              textTransform='uppercase'
            >
              {type ? formatResourceTypeForDisplay(type) : 'Unknown'}
            </Text>
          </Tooltip>
        </StyledLabel>

        {isNiaidFunded && (
          <StyledLabel
            _before={{
              bg: colorScheme['dk'],
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
        bg={props.bg || colorScheme['dk']}
        overflow='hidden'
        flex={1}
        minW='250px'
      >
        {date && (
          <Flex alignItems='center' px={{ base: 2, lg: 4 }} py={[2, 1]}>
            <Icon as={FaRegClock} mr={2}></Icon>
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
