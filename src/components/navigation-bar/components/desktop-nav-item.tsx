import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import {
  Box,
  Button,
  Link,
  Icon,
  Popover,
  PopoverTrigger,
} from '@chakra-ui/react';
import { RouteProps } from '..';
import { DesktopSubNav } from './menu-desktop';

// Desktop Navigation link styles
export const DesktopNavItem = ({
  label,
  routes,
  href,
  isExternal,
  isActive,
}: RouteProps) => {
  if (!routes) {
    return (
      <Link
        href={href ?? '#'}
        fontSize='md'
        fontWeight={500}
        color='white'
        _visited={{ color: 'white', _hover: { color: 'white' } }}
        _hover={{
          bg: 'whiteAlpha.300',
        }}
        variant='unstyled'
        cursor='pointer'
        whiteSpace='nowrap'
        display='flex'
        flexDirection='column'
        w='auto'
        h='100%'
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
                as='a'
                __css={{ padding: 0 }}
                display='flex'
                href={href ?? '#'}
                fontSize='md'
                fontWeight={500}
                color='white'
                _visited={{ color: 'white' }}
                _hover={{
                  bg: 'whiteAlpha.300',
                }}
                variant='unstyled'
                cursor='pointer'
                alignItems='center'
                justifyContent='center'
                h='100%'
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
