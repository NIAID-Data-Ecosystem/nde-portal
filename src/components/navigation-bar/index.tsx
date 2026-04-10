import React from 'react';
import { FlexProps, Stack, useDisclosure } from '@chakra-ui/react';
import SITE_CONFIG from 'configs/site.config.json';
import { DesktopAuthAction } from './components/nav-auth-action';
import { useRouter } from 'next/router';
import { SiteConfig } from '../page-container/types';
import { Nav } from './components/index';
import { buildNavigationFromConfig, filterRoutesByEnv } from './utils';

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
          sx={{ '>a,>button': { px: 4, py: 2, color: 'white' } }}
        >
          {navigation.map(navItem => (
            <Nav.DesktopNavItem
              key={navItem.label}
              isActive={isRouteActive(navItem.href)}
              {...navItem}
            />
          ))}
          <DesktopAuthAction />
        </Stack>

        {/* For mobile / tablet */}
        <Nav.Toggle isOpen={isOpen} onToggle={onToggle} />
      </Nav.Bar>

      {/* Popout navigation in mobile mode */}
      {isOpen && <Nav.MobileMenu isOpen={isOpen} routes={navigation} />}
    </Nav.Wrapper>
  );
};
