import { Collapsible, Icon, Stack, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { FaAngleDown } from 'react-icons/fa6';

import { TransformedNavigationMenu } from '../types';
import {
  NavigationLinkContent,
  NavigationLinkWrapper,
} from './navigation-link';

// Mobile Navigation link styles
export const MobileNavItem = (props: TransformedNavigationMenu) => {
  const { routes } = props;
  const { open, onToggle } = useDisclosure();
  if (!routes) {
    return (
      <NavigationLinkWrapper {...props} width='100%'>
        <NavigationLinkContent {...props} />
      </NavigationLinkWrapper>
    );
  }
  return (
    <Collapsible.Root w='100%' gap={2} cursor='pointer' onOpenChange={onToggle}>
      <Collapsible.Trigger asChild>
        <NavigationLinkWrapper
          {...props}
          width='100%'
          bg={open ? 'niaid.50' : 'transparent'}
        >
          <NavigationLinkContent
            {...props}
            getIcon={props => (
              <Icon
                {...props}
                as={FaAngleDown}
                transition='all .25s ease-in-out'
                transform={open ? 'rotate(180deg)' : ''}
              ></Icon>
            )}
          />
        </NavigationLinkWrapper>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Stack
          my={2}
          px={2}
          ml={2}
          borderLeft='2px solid'
          borderColor='gray.200'
          gap={4}
        >
          {routes &&
            routes.map(route => {
              return (
                <MobileNavItem key={route.href} {...route} description='' />
              );
            })}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
