import React from 'react';
import { IconProps as ChakraIconProps } from '@chakra-ui/icon';
import { Flex, Icon } from 'nde-design-system';
import { FaFlask, FaSearchDollar, FaFileSignature } from 'react-icons/fa';
import Glyph from './components/glyph';
import MetadataConfig from 'configs/resource-metadata.json';
import { IconType } from 'react-icons';
import Tooltip from 'src/components/tooltip';

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
  property?: string;
}

export const MetadataToolTip: React.FC<MetadataToolTipProps> = ({
  label,
  property,
  children,
}) => {
  if (!property && !label) {
    return <></>;
  }
  // Description of metadata property
  const metadataProperty = MetadataConfig.find(d => d.property === property);
  return (
    <Tooltip
      label={`${label || metadataProperty?.title} ${
        metadataProperty && `: ${metadataProperty.description}`
      }`}
    >
      {children}
    </Tooltip>
  );
};
