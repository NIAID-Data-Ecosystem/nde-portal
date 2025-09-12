import {
  Box,
  BoxProps,
  Collapsible,
  Flex,
  IconButton,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import SITE_CONFIG from 'configs/site.config.json';
import { useRouter } from 'next/router';
import React from 'react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { Logo } from 'src/components/logos';
import { useMediaQuery } from 'usehooks-ts';

import { SiteConfig } from '../page-container/types';
import { MobileNavItem } from './components/navigation-mobile-menu';
import { DesktopNavItem } from './components/navigation-popover';
import { buildNavigationFromConfig, filterRoutesByEnv } from './helpers';

export const Navigation: React.FC<BoxProps> = props => {
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const { open, onToggle } = useDisclosure();
  const isLargerThanMd = useMediaQuery('(min-width: 54rem)', {
    initializeWithValue: false,
    defaultValue: true,
  });
  const router = useRouter();

  // Build navigation from config
  const navigationData = buildNavigationFromConfig(SITE_CONFIG as SiteConfig);

  const navigationFilteredByEnvironment = filterRoutesByEnv(
    navigationData,
    process.env.NEXT_PUBLIC_APP_ENV || '',
  );

  return (
    <Box
      id='nde-navigation'
      as='nav'
      w='100%'
      minW={300}
      zIndex='popover'
      aria-label='Main navigation'
      {...props}
    >
      <Stack
        direction='row'
        gap={4}
        bg='niaid.500'
        color='white'
        minH='60px'
        pl={6}
        pr={4}
        borderBottom={1}
        borderStyle='solid'
        borderColor='gray.200'
        alignItems={{ base: 'center', md: 'center' }}
      >
        <Flex alignItems='center' py={4} flex={{ base: 1, md: 'auto' }}>
          <Logo href='/' />
        </Flex>

        {/* For desktop */}
        {isLargerThanMd && (
          <Stack
            role='tablist'
            direction='row'
            gap={{ base: 1 }}
            display={{ base: 'none', md: 'flex' }}
            ml={{ base: 6, lg: 10 }}
            flex={1}
            justifyContent='flex-end'
            css={{ '>a,>button': { px: 4, py: 2 } }}
          >
            {navigationFilteredByEnvironment?.map(navItem => (
              <DesktopNavItem
                key={navItem.label}
                isActive={
                  router.asPath === navItem.href ||
                  router.pathname === navItem.href
                }
                {...navItem}
              />
            ))}
          </Stack>
        )}

        {/* For mobile / tablet */}
        {/* Popout navigation in mobile mode */}
        {navigationFilteredByEnvironment && (
          <Collapsible.Root>
            <Collapsible.Trigger asChild>
              <IconButton
                colorPalette='niaid'
                display={isLargerThanMd ? 'none' : 'flex'}
                aria-label={
                  open ? 'Toggle Navigation closed.' : 'Toggle Navigation open.'
                }
                onClick={onToggle}
              >
                {open ? <FaXmark /> : <FaBars />}
              </IconButton>
            </Collapsible.Trigger>
            <Portal container={mobileMenuRef}>
              <Collapsible.Content position='relative'>
                <Stack display={{ base: 'flex', lg: 'none' }} p={2}>
                  {navigationFilteredByEnvironment &&
                    navigationFilteredByEnvironment.map(navItem => {
                      return <MobileNavItem key={navItem.label} {...navItem} />;
                    })}
                </Stack>
              </Collapsible.Content>
            </Portal>
          </Collapsible.Root>
        )}
      </Stack>
      <div ref={mobileMenuRef} />
    </Box>
  );
};
