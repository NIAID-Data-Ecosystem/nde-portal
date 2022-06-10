import { IconProps as ChakraIconProps } from '@chakra-ui/icon';
import { BoxProps, Flex, Icon, Square, Tooltip } from 'nde-design-system';
import { FaFlask, FaSearchDollar, FaRulerCombined } from 'react-icons/fa';
import Glyph from './components/glyph';
import { getMetadataColor, getMetadataLabel } from './helpers';

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

  let FaIcon = null;
  if (glyph?.toLowerCase() === 'funding') {
    FaIcon = FaSearchDollar;
  } else if (glyph?.toLowerCase() === 'variablemeasured') {
    FaIcon = FaFlask;
  } else {
    FaIcon = null;
  }

  if (FaIcon) {
    return (
      <Tooltip label={label || getMetadataLabel(glyph)}>
        <Flex cursor='pointer'>
          <Icon
            viewBox='0 0 200 200'
            boxSize={5}
            as={FaIcon}
            color='#000'
            fill='#000'
            {...props}
          />
        </Flex>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={getMetadataLabel(glyph)}>
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
        <Glyph id={id} glyph={glyph} stroke='currentColor' title={title} />
      </Icon>
    </Tooltip>
  );
};
