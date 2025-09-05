import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Icon,
  Popover,
  Stack,
  Portal,
} from '@chakra-ui/react';
import {
  NavigationLinkContent,
  NavigationLinkWrapper,
} from './navigation-link';
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
  // Common styles for nav buttons
  const navButtonStyles = {
    colorPalette: 'niaid',
    size: 'lg',
    px: 4,
    py: 2,
    borderRadius: 'none',
    display: 'flex',
    alignItems: 'center',
    _hover: {
      bg: 'whiteAlpha.300',
    },
    outlineColor: 'whiteAlpha.300',
  } as ButtonProps;

  if (!routes) {
    return (
      <Button asChild display='flex' {...navButtonStyles}>
        <a href={href ?? '#'} target={isExternal ? '_blank' : '_self'}>
          <Flex position='relative' justifyContent='center'>
            {label}
            {isActive && (
              <Box
                bg='white'
                width={8}
                height={0.5}
                position='absolute'
                bottom={0}
              />
            )}
          </Flex>
        </a>
      </Button>
    );
  }

  const linkProps = {
    href,
    _visited: { color: 'white' },
  };

  return (
    <>
      <Popover.Root
        positioning={{ placement: 'bottom-start' }}
        closeOnEscape
        lazyMount
        autoFocus={false}
      >
        <Popover.Trigger asChild>
          <Button
            as={href ? 'a' : 'button'}
            {...navButtonStyles}
            {...(href ? linkProps : {})}
          >
            {label}

            {routes && <Icon as={FaCaretDown} ml={1} w={4} h={4} />}
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body p={2}>
                <Stack role='tablist'>
                  {routes.map(route => (
                    <NavigationLinkWrapper key={route.label} {...route}>
                      <NavigationLinkContent {...route} />
                    </NavigationLinkWrapper>
                  ))}
                </Stack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </>
  );
};
