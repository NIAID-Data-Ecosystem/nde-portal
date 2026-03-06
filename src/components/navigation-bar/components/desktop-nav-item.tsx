import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import {
  Box,
  Button,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  Stack,
} from '@chakra-ui/react';
import { TransformedNavigationMenu } from '../types';
import { NavMenuItem } from './nav-menu-item';

interface DesktopNavItemProps extends TransformedNavigationMenu {
  isActive?: boolean;
}

const NavSimpleButton = ({
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

const NavMenuButton = ({
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
              whiteSpace='nowrap'
              _hover={{ bg: 'whiteAlpha.300' }}
              {...linkProps}
            >
              {label}
              <Icon as={FaCaretDown} ml={1} w={4} h={4} />
            </Button>
          </PopoverTrigger>
          {isOpen && <DesktopNavMenu routes={routes} />}
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
      <NavSimpleButton
        label={label}
        href={href}
        isExternal={isExternal}
        isActive={isActive}
      />
    );
  }

  return (
    <NavMenuButton
      label={label}
      routes={routes}
      href={href}
      isExternal={isExternal}
    />
  );
};

export const DesktopNavMenu = ({
  routes,
}: {
  routes: TransformedNavigationMenu[];
}): JSX.Element | null => {
  if (!routes || routes.length === 0) return null;

  return (
    <PopoverContent
      border={0}
      boxShadow='xl'
      bg='white'
      py={2}
      rounded='xl'
      minW='sm'
    >
      <PopoverArrow />
      <PopoverBody>
        <Stack>
          {routes.map(route => (
            <NavMenuItem key={`${route.href ?? route.label}`} {...route} />
          ))}
        </Stack>
      </PopoverBody>
    </PopoverContent>
  );
};
