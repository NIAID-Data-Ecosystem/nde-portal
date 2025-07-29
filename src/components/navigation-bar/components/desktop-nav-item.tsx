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

// Desktop Navigation link styles
export const DesktopNavItem = ({
  label,
  routes,
  href,
  isExternal,
  isActive,
}: DesktopNavItemProps) => {
  if (!routes) {
    return (
      <Link
        href={href ?? '#'}
        color='white'
        fontSize='md'
        fontWeight={500}
        _visited={{ color: 'white', _hover: { color: 'white' } }}
        _hover={{
          bg: 'whiteAlpha.300',
          color: 'white',
        }}
        variant='unstyled'
        cursor='pointer'
        whiteSpace='nowrap'
        w='auto'
        h='100%'
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        textAlign='center'
        target={isExternal ? '_blank' : '_self'}
      >
        {label}
        {isActive && <Box bg='white' width={8} height={0.5} />}
      </Link>
    );
  }

  const linkProps = {
    href,
    _visited: { color: 'white' },

    variant: 'unstyled',
  };

  return (
    <>
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
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
                {...(href ? linkProps : {})}
              >
                {label}

                {routes && <Icon as={FaCaretDown} ml={1} w={4} h={4} />}
              </Button>
            </PopoverTrigger>
            {isOpen && <DesktopSubNav routes={routes} />}
          </>
        )}
      </Popover>
    </>
  );
};
