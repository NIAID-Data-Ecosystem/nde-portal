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
import { useRouter } from 'next/router';
import { buildNavigationFromConfig, filterRoutesByEnv } from './helpers';
import { SiteConfig } from '../page-container/types';

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
    <Box
      id='nde-navigation'
      as='nav'
      w='100%'
      minW={300}
      zIndex='modal'
      aria-label='Main navigation'
      {...props}
    >
      <Flex
        bg='niaid.500'
        color='white'
        minH='60px'
        // h={['105px', '77px', '89px']}
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

        {/* For mobile / tablet */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          icon={
            isOpen ? (
              <Icon as={FaXmark} w={5} h={5} />
            ) : (
              <Icon as={FaBars} w={4} h={4} />
            )
          }
          onClick={onToggle}
          colorScheme='niaid'
          color='white'
          _hover={{ bg: 'whiteAlpha.500' }}
          variant='ghost'
          size='md'
        />
      </Flex>

      {/* Popout navigation in mobile mode */}
      {isOpen && <MobileSubMenu isOpen={isOpen} navigation={navigation} />}
    </Box>
  );
};
