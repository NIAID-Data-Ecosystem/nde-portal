import { Button, ButtonProps, Icon, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaAngleRight } from 'react-icons/fa6';

export interface ArrowButtonProps extends ButtonProps {
  href?: string;
  isExternal?: boolean;
  icon?: React.ElementType;
  hasArrow?: boolean;
}

const TRANSLATE_X = 10;
export const ArrowButton = ({
  href,
  isExternal,
  icon,
  hasArrow,
  children,
  ...props
}: ArrowButtonProps) => {
  const textStyles = {
    truncate: true,
    w: '100%',
    pr: hasArrow ? `${TRANSLATE_X}px` : undefined,
  };
  return (
    <Button asChild={!!href} size='xs' {...props}>
      {href ? (
        <NextLink
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
        >
          {icon ? <Icon as={icon} /> : null}
          <Text {...textStyles}>{children}</Text>
          {hasArrow && (
            <Icon
              as={FaAngleRight}
              transform={`translateX(-${TRANSLATE_X}px)`}
            />
          )}
        </NextLink>
      ) : (
        <Text {...textStyles}>{children}</Text>
      )}
    </Button>
  );
};
