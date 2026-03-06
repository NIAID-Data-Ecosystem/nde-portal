import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  FlexProps,
  Stack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import SITE_CONFIG from 'configs/site.config.json';
import { Logo } from 'src/components/logos';
import { DesktopNavItem } from './components/desktop-nav-item';
import { DesktopAuthAction } from './components/nav-auth-action';
import { useRouter } from 'next/router';
import { buildNavigationFromConfig, filterRoutesByEnv } from './helpers';
import { SiteConfig } from '../page-container/types';
import { Nav } from './components/navigation';

const MobileSubMenu = dynamic(
  () => import('./components/menu-mobile').then(mod => mod.MobileSubMenu),
  {
    loading: () => null,
  },
);

export const Navigation: React.FC<FlexProps> = props => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV || '';

  const navigation = React.useMemo(
    () =>
      filterRoutesByEnv(
        buildNavigationFromConfig(SITE_CONFIG as SiteConfig),
        appEnvironment,
      ),
    [appEnvironment],
  );

  const isRouteActive = (href?: string) =>
    Boolean(href && (router.asPath === href || router.pathname === href));

  return (
    <Nav.Wrapper {...props}>
      <Nav.Bar>
        {/* For desktop */}
        <Stack
          direction='row'
          spacing={{ base: 0 }}
          display={{ base: 'none', md: 'flex' }}
          ml={{ base: 6, lg: 10 }}
          flex={1}
          justifyContent='flex-end'
          sx={{ '>a,>button': { px: 4, py: 2 } }}
        >
          {navigation.map(navItem => (
            <DesktopNavItem
              key={navItem.label}
              isActive={isRouteActive(navItem.href)}
              {...navItem}
            />
          ))}
        </Stack>

        <Flex
          display={{ base: 'none', md: 'flex' }}
          alignItems='center'
          ml={4}
          flexShrink={0}
        >
          <DesktopAuthAction />
        </Flex>

        {/* For mobile / tablet */}
        <Nav.Toggle isOpen={isOpen} onToggle={onToggle} />
      </Nav.Bar>

      {/* Popout navigation in mobile mode */}
      {isOpen && <MobileSubMenu isOpen={isOpen} navigation={navigation} />}
    </Nav.Wrapper>
  );
};
