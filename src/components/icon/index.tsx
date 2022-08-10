import React from 'react';
import { IconProps as ChakraIconProps } from '@chakra-ui/icon';
import { BoxProps, Flex, Icon, Square, Tooltip } from 'nde-design-system';
import { FaFlask, FaSearchDollar } from 'react-icons/fa';
import Glyph from './components/glyph';
import { getMetadataColor, getMetadataLabel } from './helpers';
import MetadataConfig from 'configs/resource-metadata.json';
import { IconType } from 'react-icons';

// Badge encircling metadata property icon
interface MetadataBadgeProps extends BoxProps {
  property: string;
}

export const MetadataBadge: React.FC<MetadataBadgeProps> = ({
  property,
  children,
  ...props
}) => {
  if (!getMetadataLabel(property)) {
    return <></>;
  }
  return (
    <Square bg={getMetadataColor(property)} p={1} borderRadius='4px' {...props}>
      {children}
    </Square>
  );
};

// Metadata icon svg.
export interface IconProps extends ChakraIconProps {
  id: string; // id for aria-labelledby for icon for accessibility
  glyph?: string;
  label?: string; // label for icon for accessibility
  title?: string; // title for svg (accessibility)
}

export const MetadataIcon = ({
  id,
  glyph,
  label,
  title,
  ...props
}: IconProps) => {
  if (!glyph) {
    return <></>;
  }

  let FaIcon = null as IconType | null;
  if (glyph?.toLowerCase() === 'funding') {
    FaIcon = FaSearchDollar;
  } else if (glyph?.toLowerCase() === 'variablemeasured') {
    FaIcon = FaFlask;
  } else {
    FaIcon = null;
  }

  const TooltipIcon = React.forwardRef<HTMLDivElement, IconProps>(
    (props, ref) => {
      return (
        <Flex cursor='pointer' ref={ref}>
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
              cursor='pointer'
              viewBox='0 0 200 200'
              color='#000'
              fill='#000'
              boxSize={5}
              aria-labelledby={id}
              role='img'
              {...props}
            >
              <Glyph
                id={id}
                glyph={glyph}
                stroke='currentColor'
                title={title}
              />
            </Icon>
          )}
        </Flex>
      );
    },
  );

  // Description of metadata property
  const description = MetadataConfig.find(d => d.property === glyph);
  return (
    <Tooltip
      label={`${label || getMetadataLabel(glyph)} ${
        description && `: ${description.description}`
      }`}
    >
      <TooltipIcon id={id} {...props} />
    </Tooltip>
  );
};
