import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import {
  Box,
  Button,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
} from '@chakra-ui/react';
import { DesktopSubNav } from './menu-desktop';
import { TransformedNavigationMenu } from '../types';

interface DesktopNavItemProps extends TransformedNavigationMenu {
  isActive?: boolean;
}

const DesktopSimpleNavItem = ({
  label,
  href,
  isExternal,
  isActive,
}: {
  label: string;
  href?: string;
  isExternal?: boolean;
  isActive?: boolean;
}) => {
  return (
    <Link
      href={href ?? '#'}
      variant='unstyled'
      color='white'
      fontSize='md'
      fontWeight={500}
      cursor='pointer'
      whiteSpace='nowrap'
      w='auto'
      h='100%'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      textAlign='center'
      _visited={{ color: 'white', _hover: { color: 'white' } }}
      _hover={{ bg: 'whiteAlpha.300', color: 'white' }}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {label}
      {isActive && <Box bg='white' width={8} height={0.5} />}
    </Link>
  );
};

const DesktopPopoverNavItem = ({
  label,
  routes,
  href,
  isExternal,
}: {
  label: string;
  routes: TransformedNavigationMenu[];
  href?: string;
  isExternal?: boolean;
}) => {
  const linkProps = href
    ? {
        href,
        target: isExternal ? '_blank' : '_self',
        rel: isExternal ? 'noopener noreferrer' : undefined,
        _visited: { color: 'white' },
        variant: 'unstyled' as const,
      }
    : {};

  return (
    <Popover
      trigger='click'
      placement='bottom-start'
      autoFocus
      closeOnEsc
      isLazy
    >
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Button
              as={href ? 'a' : 'button'}
              __css={{ padding: 0 }}
              display='flex'
              fontSize='md'
              fontWeight={500}
              color='white'
              cursor='pointer'
              alignItems='center'
              justifyContent='center'
              h='100%'
              _hover={{ bg: 'whiteAlpha.300' }}
              {...linkProps}
            >
              {label}
              <Icon as={FaCaretDown} ml={1} w={4} h={4} />
            </Button>
          </PopoverTrigger>
          {isOpen && <DesktopSubNav routes={routes} />}
        </>
      )}
    </Popover>
  );
};

export const DesktopNavItem = ({
  label,
  routes,
  href,
  isExternal,
  isActive,
}: DesktopNavItemProps) => {
  if (!routes) {
    return (
      <DesktopSimpleNavItem
        label={label}
        href={href}
        isExternal={isExternal}
        isActive={isActive}
      />
    );
  }

  return (
    <DesktopPopoverNavItem
      label={label}
      routes={routes}
      href={href}
      isExternal={isExternal}
    />
  );
};
