import { Button, ButtonProps, Icon, Text, TextProps } from '@chakra-ui/react';
import NextLink, { LinkProps } from 'next/link';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa6';

export interface ArrowButtonProps extends ButtonProps {
  href?: LinkProps['href'];
  isExternal?: boolean;
  icon?: React.ElementType;
  hasArrow?: boolean;
  textProps?: TextProps;
}

const TRANSLATE_X = 2;
export const ArrowButton = ({
  href,
  isExternal,
  icon,
  hasArrow,
  children,
  textProps,
  ...props
}: ArrowButtonProps) => {
  const textStyles = {
    truncate: true,
    pr: hasArrow ? `${TRANSLATE_X}px` : undefined,
    ...textProps,
  };
  return (
    <Button
      asChild={!!href}
      size='sm'
      css={
        //  Animation for arrow icon.
        hasArrow && {
          '& .button-arrow-icon': {
            transform: `translateX(-${TRANSLATE_X}px)`,
            transition: 'transform 0.2s ease-in-out',
          },
          _hover: {
            '& .button-arrow-icon': {
              transform: `translateX(${TRANSLATE_X}px)`,
              transition: 'transform 0.2s ease-in-out',
            },
          },
          /* Respect users with reduced motion preference */
          '@media (prefers-reduced-motion: reduce)': {
            '& .button-arrow-icon': {
              transform: 'none',
              transition: 'none',
            },
            '&:hover .button-arrow-icon': {
              transform: 'none',
            },
          },
        }
      }
      {...props}
    >
      {href ? (
        <NextLink
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
        >
          {icon ? <Icon as={icon} /> : null}
          <Text {...textStyles}>{children}</Text>
          {hasArrow && <Icon className='button-arrow-icon' as={FaAngleRight} />}
        </NextLink>
      ) : (
        <Text {...textStyles}>{children}</Text>
      )}
    </Button>
  );
};
