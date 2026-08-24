import React from 'react';
import {
  Flex,
  Icon,
  IconProps as ChakraIconProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import {
  FaFingerprint,
  FaQuoteLeft,
  FaInfo,
  FaCalendarDays,
  FaLaptopCode,
  FaCode,
} from 'react-icons/fa6';
import { IconType } from 'react-icons';
import Glyph from './components/glyph';
import { FaLanguage } from 'react-icons/fa6';

// Metadata icon svg.
export interface IconProps extends ChakraIconProps {
  id: string; // id for aria-labelledby for icon for accessibility
  glyph?: string;
  label?: string; // label for icon for accessibility
  title?: string; // title for svg (accessibility)
  disabled?: boolean; // if true, icon is displayed as disable (with bar through it)
}

// Icon displaying symbol
export const MetadataIcon = React.forwardRef<HTMLDivElement, IconProps>(
  (
    {
      id,
      glyph,
      title,
      color,
      fill,
      disabled,
      boxSize,
      viewBox,
      ...props
    }: IconProps,
    ref,
  ) => {
    if (!glyph) {
      return <></>;
    }
    let FaIcon = null as IconType | null;

    if (glyph?.toLowerCase() === 'citation') {
      FaIcon = FaQuoteLeft;
    } else if (glyph?.toLowerCase() === 'identifier') {
      FaIcon = FaFingerprint;
    } else if (glyph?.toLowerCase() === 'inlanguage') {
      FaIcon = FaLanguage;
    } else if (glyph?.toLowerCase() === 'applicationcategory') {
      FaIcon = FaLaptopCode;
    } else if (glyph?.toLowerCase() === 'programminglanguage') {
      FaIcon = FaCode;
    } else if (glyph?.toLowerCase() === 'date') {
      FaIcon = FaCalendarDays;
    } else if (glyph?.toLowerCase() === 'info') {
      FaIcon = () => (
        <Icon
          color={color || 'gray.700'}
          fill={fill || '#000'}
          boxSize={boxSize || '1.15rem'}
          border='0.625px solid'
          borderRadius='100%'
          p='0.2rem'
          aria-label='information'
          {...props}
          asChild
        >
          <FaInfo />
        </Icon>
      );
    } else {
      FaIcon = null;
    }
    return (
      <Flex ref={ref}>
        <VisuallyHidden>
          <span id={id}>{title}</span>
        </VisuallyHidden>
        {FaIcon ? (
          <Icon
            viewBox={viewBox || '0 0 200 200'}
            color={color || '#000'}
            fill={fill || '#000'}
            boxSize={boxSize || 5}
            // title={title}
            aria-label={title}
            {...props}
            asChild
          >
            <FaIcon />
          </Icon>
        ) : (
          <Icon
            viewBox={viewBox || '0 0 200 200'}
            color={color || '#000'}
            fill={fill || '#000'}
            boxSize={boxSize || 5}
            aria-labelledby={id}
            role='img'
            // title={title}
            aria-label={title}
            {...props}
          >
            <Glyph id={id} glyph={glyph} title={title} disabled={disabled} />
          </Icon>
        )}
      </Flex>
    );
  },
);
