import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { FaRegClock } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';

export interface TypeBannerProps extends FlexProps {
  label: string;
  type?: APIResourceType | 'Disease';
  date?: FormattedResource['date'];
  sourceName?: string[] | null;
  isNiaidFunded?: boolean;
}

export const getTypeColor = (type?: APIResourceType | string) => {
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
  } else if (typeLower === 'disease') {
    lt = 'purple.600';
    dk = 'purple.800';
  } else {
    lt = 'niaid.500';
  }
  return { lt, dk };
};

const Label = ({ bg = 'info.default', ...props }: FlexProps) => {
  return (
    <Flex
      display='inline-flex'
      alignItems='center'
      lineHeight='1.5'
      position='relative'
      zIndex='0'
      mx={2}
      px={2}
      height='100%'
      _before={{
        content: "''",
        bg,
        boxShadow: '0 0 0 5px #fff',
        display: 'block',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'skew(-12deg)',
        width: '100%',
        zIndex: '-4',
      }}
      {...props}
    />
  );
};

const TypeBanner: React.FC<TypeBannerProps> = ({
  label,
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
      height='100%'
      bg={props.bg || colorScheme['dk']}
      {...props}
    >
      <Flex
        bg={props.bg || colorScheme['dk']}
        px={{ base: 2, md: 4 }}
        pl={pl}
        py={0}
        overflow='hidden'
        minW='250px'
        height='100%'
      >
        <Label bg={colorScheme['lt']}>
          <Tooltip
            content={abstractTooltipLabel || descriptionTooltipLabel}
            showArrow
          >
            <Text
              fontSize='xs'
              color={type ? 'white' : colorScheme['lt']}
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
              textTransform='uppercase'
            >
              {label || 'Unknown'}
            </Text>
          </Tooltip>
        </Label>

        {isNiaidFunded && (
          <Label bg={colorScheme['dk']}>
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
            >
              NIAID
            </Text>
          </Label>
        )}
      </Flex>
      {(children || date) && (
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
      )}
    </Flex>
  );
};

export default TypeBanner;
