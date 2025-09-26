import { Button, ButtonProps, Icon, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export interface ArrowButtonProps extends ButtonProps {
  href?: string;
  isExternal?: boolean;
  icon?: React.ElementType;
  hasArrow?: boolean;
}

export const ArrowButton = ({
  href,
  isExternal,
  icon,
  hasArrow,
  children,
  ...props
}: ArrowButtonProps) => {
  return (
    <Button asChild={!!href} size='xs' {...props}>
      {href ? (
        <NextLink
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
        >
          {icon ? <Icon as={icon} /> : null}
          <Text truncate w='100%'>
            {children}
          </Text>
        </NextLink>
      ) : (
        <Text truncate w='100%'>
          {children}
        </Text>
      )}
    </Button>
  );
};
