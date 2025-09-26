import { Button, ButtonProps, Icon } from '@chakra-ui/react';
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
  title,
  ...props
}: ArrowButtonProps) => {
  return (
    <Button
      key={title}
      asChild
      size='xs'
      // variant={idx % 2 ? 'solid' : 'outline'}
      flex={{ base: 1, sm: 'unset' }}
      minWidth={{ base: '180px', md: 'unset' }}
      maxWidth={{ base: 'unset', md: '250px' }}
      {...props}
    >
      {href ? (
        <NextLink
          href={href}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
        >
          {icon ? <Icon as={icon} /> : null}
          {title}
        </NextLink>
      ) : (
        <>{title}</>
      )}
    </Button>
  );
};
