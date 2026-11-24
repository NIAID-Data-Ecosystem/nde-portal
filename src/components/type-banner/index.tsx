import { Flex, Span } from '@chakra-ui/react';
import React from 'react';
import Tooltip from 'src/components/tooltip';
import { SHOW_RETIRED_RESOURCE_CATALOG_UI } from 'src/utils/feature-flags';

import {
  getTypeColors,
  getTypeDefinition,
  PROGRAM_VARIANT_LABELS,
} from './helpers';
import { TypeBannerProps } from './types';

// A skewed tab with a white outline. The shape is drawn on ::before so the
// text stays upright, and fills the label's full height.
const Label = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <Flex
    alignItems='center'
    position='relative'
    zIndex={0}
    mx={2}
    px={4}
    py={2}
    color='white'
    fontSize='sm'
    fontWeight='semibold'
    lineHeight={1.5}
    textTransform='uppercase'
    whiteSpace='nowrap'
    _before={{
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      bg,
      boxShadow: '0 0 0 5px white',
      transform: 'skew(-12deg)',
    }}
  >
    {children}
  </Flex>
);

const TypeBanner: React.FC<TypeBannerProps> = ({
  label,
  type,
  isNiaidFunded,
  creativeWorkStatus,
  programVariant,
  pl,
  children,
  ...props
}) => {
  // Gated behind SHOW_RETIRED_RESOURCE_CATALOG_UI until approved for production.
  const isRetired =
    SHOW_RETIRED_RESOURCE_CATALOG_UI &&
    type === 'ResourceCatalog' &&
    creativeWorkStatus === 'Retired';
  const colors = getTypeColors(type, {
    isRetired,
    isProgram: !!programVariant,
  });
  const definition = getTypeDefinition(type);

  return (
    <Flex flexWrap='wrap' w='100%' bg={colors.banner} {...props}>
      {/* Clips each label's outline to its slanted sides. */}
      <Flex overflow='hidden' px={{ base: 2, lg: 4 }} pl={pl}>
        <Label bg={colors.label}>
          <Tooltip content={definition} disabled={!definition}>
            {/* Without a type (e.g. while a card loads), keep the label's
            footprint but hide its text. */}
            <Span visibility={type ? 'visible' : 'hidden'}>
              {(programVariant && PROGRAM_VARIANT_LABELS[programVariant]) ||
                label ||
                'Unknown'}
            </Span>
          </Tooltip>
        </Label>
        {isNiaidFunded && (
          // White text needs a dark fill, so on the light retired and data
          // collection banners this label borrows the type label's.
          <Label
            bg={
              isRetired || type === 'DataCollection'
                ? colors.label
                : colors.banner
            }
          >
            NIAID
          </Label>
        )}
      </Flex>
      {children}
    </Flex>
  );
};

export default TypeBanner;
