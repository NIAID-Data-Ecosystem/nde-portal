import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  FlexProps,
  Stack,
  Icon,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import NAVIGATION from './routes.json';
import { Logo } from 'src/components/logos';
import { DesktopNavItem } from './components/desktop-nav-item';
import { useRouter } from 'next/router';

const MobileSubMenu = dynamic(
  () => import('./components/menu-mobile').then(mod => mod.MobileSubMenu),
  {
    loading: () => <p></p>,
  },
);

export interface RouteProps {
  label: string;
  subLabel?: string;
  routes?: Array<RouteProps>;
  href?: string;
  isExternal?: boolean;
  isActive?: boolean;
}

export const Navigation: React.FC<FlexProps> = props => {
  const { isOpen, onToggle } = useDisclosure();
  const [isLargerThanMd] = useMediaQuery('(min-width: 54rem)', {
    ssr: true,
    fallback: false,
  });
  const router = useRouter();

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
      <Flex
        bg='tertiary.700'
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
          <Logo href={NAVIGATION?.href} />
        </Flex>
        {/* For desktop */}
        {isLargerThanMd && (
          <Stack
            direction='row'
            spacing={{ base: 0 }}
            display={{ base: 'none', md: 'flex' }}
            ml={{ base: 6, lg: 10 }}
            flex={1}
            justifyContent='flex-end'
            sx={{ '>a': { px: 4, py: 2 } }}
          >
            {NAVIGATION.routes &&
              NAVIGATION.routes.map(navItem => (
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
        {NAVIGATION.routes && (
          <IconButton
            display={isLargerThanMd ? 'none' : 'flex'}
            aria-label={
              isOpen ? 'Toggle Navigation closed.' : 'Toggle Navigation open.'
            }
            icon={
              isOpen ? (
                <Icon as={FaXmark} w={5} h={5} />
              ) : (
                <Icon as={FaBars} w={4} h={4} />
              )
            }
            onClick={onToggle}
            colorScheme='tertiary'
            color='#fff'
            _hover={{ bg: 'whiteAlpha.500' }}
            variant='ghost'
            size='md'
          />
        )}
      </Flex>

      {/* Popout navigation in mobile mode */}
      {isOpen && <MobileSubMenu isOpen={isOpen} />}
    </Box>
  );
};
