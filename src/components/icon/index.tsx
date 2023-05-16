import React from 'react';
import { IconProps as ChakraIconProps } from '@chakra-ui/icon';
import { Flex, Icon } from '@candicecz/test-design-system';
import {
  FaFlask,
  FaFingerprint,
  FaSearchDollar,
  FaFileSignature,
  FaQuoteLeft,
  FaInfo,
  FaRegCalendarAlt,
  FaLaptopCode,
  FaCode,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import Glyph from './components/glyph';
import MetadataConfig from 'configs/resource-metadata.json';
import Tooltip from 'src/components/tooltip';
import { ResourceMetadata } from 'src/utils/schema-definitions/types';

// Metadata icon svg.
export interface IconProps
  extends Omit<ChakraIconProps, 'textUnderlineOffset'> {
  id: string; // id for aria-labelledby for icon for accessibility
  glyph?: string;
  label?: string; // label for icon for accessibility
  title?: string; // title for svg (accessibility)
}

// Icon displaying symbol
export const MetadataIcon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ id, glyph, title, color, fill, boxSize, viewBox }: IconProps, ref) => {
    if (!glyph) {
      return <></>;
    }
    let FaIcon = null as IconType | null;
    if (glyph?.toLowerCase() === 'funding') {
      FaIcon = FaSearchDollar;
    } else if (glyph?.toLowerCase() === 'variablemeasured') {
      FaIcon = FaFlask;
    } else if (glyph?.toLowerCase() === 'usageinfo') {
      FaIcon = FaFileSignature;
    } else if (glyph?.toLowerCase() === 'citation') {
      FaIcon = FaQuoteLeft;
    } else if (glyph?.toLowerCase() === 'identifier') {
      FaIcon = FaFingerprint;
    } else if (glyph?.toLowerCase() === 'applicationcategory') {
      FaIcon = FaLaptopCode;
    } else if (glyph?.toLowerCase() === 'programminglanguage') {
      FaIcon = FaCode;
    } else if (glyph?.toLowerCase() === 'date') {
      FaIcon = FaRegCalendarAlt;
    } else if (glyph?.toLowerCase() === 'info') {
      FaIcon = () => (
        <Icon
          as={FaInfo}
          color={color || 'gray.700'}
          fill={fill || '#000'}
          boxSize={boxSize || '1.15rem'}
          border='0.625px solid'
          borderRadius='100%'
          p='0.2rem'
          aria-label='information'
          title='information'
        />
      );
    } else {
      FaIcon = null;
    }
    return (
      <Flex ref={ref}>
        {FaIcon ? (
          <Icon
            as={FaIcon}
            viewBox={viewBox || '0 0 200 200'}
            color={color || '#000'}
            fill={fill || '#000'}
            boxSize={boxSize || 5}
            title={title}
            aria-label={title}
          />
        ) : (
          <Icon
            viewBox={viewBox || '0 0 200 200'}
            color={color || '#000'}
            fill={fill || '#000'}
            boxSize={boxSize || 5}
            aria-labelledby={id}
            role='img'
            title={title}
            aria-label={title}
          >
            <Glyph id={id} glyph={glyph} stroke='currentColor' />
          </Icon>
        )}
      </Flex>
    );
  },
);

interface MetadataToolTipProps {
  label?: string;
  description?: string;
  propertyName?: string;
  recordType?: string;
  showAbstract?: boolean; // if true, show shortened definition if available.
}

export const MetadataToolTip: React.FC<MetadataToolTipProps> = ({
  label,
  description,
  propertyName,
  recordType,
  showAbstract,
  children,
}) => {
  if (!propertyName && !label) {
    return <></>;
  }

  const property = MetadataConfig.find(
    d => d.property === propertyName,
  ) as ResourceMetadata;

  let tooltip_label = label || property?.title || '';
  let tooltip_description = description || '';

  // Description of metadata property
  if (!tooltip_description) {
    let type = recordType?.toLowerCase();
    // if showAbstract is true we show a brief description where available.
    if (showAbstract && property.abstract) {
      if (type && property.abstract?.[type]) {
        // if record type exists use it to get a more specific definition if available.
        tooltip_description = property.abstract[type];
      } else {
        // get more general definition if specific one does not exist.
        let descriptions = Object.values(property.abstract);
        tooltip_description = descriptions.length === 0 ? '' : descriptions[0];
      }
    } else if (property && property?.description) {
      if (type && property.description?.[type]) {
        // if record type exists use it to get a more specific definition if available.
        tooltip_description = property.description[type];
      } else {
        // get more general definition if specific one does not exist.
        let descriptions = Object.values(property.description);
        tooltip_description = descriptions.length === 0 ? '' : descriptions[0];
      }
    }
  }
  return (
    <Tooltip
      label={`${tooltip_label} ${
        tooltip_description &&
        `: ${
          tooltip_description.charAt(0).toLocaleUpperCase() +
          tooltip_description.slice(1)
        }`
      }`}
    >
      {children}
    </Tooltip>
  );
};
