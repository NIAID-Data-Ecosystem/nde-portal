import React from 'react';
import { IconProps as ChakraIconProps } from '@chakra-ui/icon';
import { Flex, Icon } from 'nde-design-system';
import {
  FaFlask,
  FaFingerprint,
  FaSearchDollar,
  FaFileSignature,
  FaQuoteLeft,
} from 'react-icons/fa';
import Glyph from './components/glyph';
import MetadataConfig from 'configs/resource-metadata.json';
import { IconType } from 'react-icons';
import Tooltip from 'src/components/tooltip';
import { ResourceMetadata } from 'src/utils/schema-definitions/types';

// Metadata icon svg.
export interface IconProps extends ChakraIconProps {
  id: string; // id for aria-labelledby for icon for accessibility
  glyph?: string;
  label?: string; // label for icon for accessibility
  title?: string; // title for svg (accessibility)
}

// Icon displaying symbol
export const MetadataIcon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ id, glyph, label, title, ...props }: IconProps, ref) => {
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
    } else {
      FaIcon = null;
    }
    return (
      <Flex ref={ref}>
        {FaIcon ? (
          <Icon
            viewBox='0 0 200 200'
            boxSize={5}
            as={FaIcon}
            color='#000'
            fill='#000'
            {...props}
          />
        ) : (
          <Icon
            viewBox='0 0 200 200'
            color='#000'
            fill='#000'
            boxSize={5}
            aria-labelledby={id}
            role='img'
            {...props}
          >
            <Glyph id={id} glyph={glyph} stroke='currentColor' title={title} />
          </Icon>
        )}
      </Flex>
    );
  },
);

interface MetadataToolTipProps {
  label?: string; // label for icon for accessibility
  propertyName?: string;
  recordType?: string;
}

export const MetadataToolTip: React.FC<MetadataToolTipProps> = ({
  label,
  propertyName,
  recordType,
  children,
}) => {
  if (!propertyName && !label) {
    return <></>;
  }

  const property = MetadataConfig.find(
    d => d.property === propertyName,
  ) as ResourceMetadata;

  let tooltip_label = label || property?.title || '';
  let tooltip_description = '';

  // Description of metadata property
  if (property && property?.description) {
    let type = recordType?.toLowerCase();

    if (type && property.description?.[type]) {
      // if record type exists use it to get a more specific definition if available.
      tooltip_description = property.description[type];
    } else {
      // get more general definition if specific one does not exist.
      let descriptions = Object.values(property.description);
      tooltip_description = descriptions.length === 0 ? '' : descriptions[0];
    }
  }
  return (
    <Tooltip
      label={`${tooltip_label} ${
        tooltip_description && `: ${tooltip_description}`
      }`}
    >
      {children}
    </Tooltip>
  );
};
