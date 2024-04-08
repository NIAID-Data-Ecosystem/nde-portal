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
}

export const Navigation: React.FC<FlexProps> = props => {
  const { isOpen, onToggle } = useDisclosure();
  const [isLargerThanMd] = useMediaQuery('(min-width: 48em)', {
    ssr: true,
    fallback: false,
  });

  return (
    <Box
      id='nde-navigation'
      as='nav'
      w='100%'
      minW={300}
      zIndex='banner'
      aria-label='Main navigation'
      {...props}
    >
      <Flex
        bg='tertiary.700'
        color='white'
        minH='60px'
        h={['105px', '77px', '89px']}
        px={6}
        borderBottom={1}
        borderStyle='solid'
        borderColor='gray.200'
        flex={{ base: 1, md: 'auto' }}
        alignItems='center'
      >
        <Logo href={NAVIGATION?.href} />
        {/* For desktop */}
        {isLargerThanMd && (
          <Stack
            direction='row'
            spacing={{ base: 2, lg: 4 }}
            display={{ base: 'none', md: 'flex' }}
            ml={{ base: 6, lg: 10 }}
            flex={1}
            justifyContent='flex-end'
          >
            {NAVIGATION.routes &&
              NAVIGATION.routes.map(navItem => (
                <DesktopNavItem key={navItem.label} {...navItem} />
              ))}
          </Stack>
        )}

        {/* For mobile / tablet */}
        {NAVIGATION.routes && (
          <IconButton
            display={{ base: 'flex', md: 'none' }}
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
