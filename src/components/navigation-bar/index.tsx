import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  FlexProps,
  Stack,
  Collapse,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import NAVIGATION from './routes.json';
import { Logo } from 'src/components/logos';

const MobileNavItem = dynamic(() =>
  import('./components/mobile-nav-item').then(mod => mod.MobileNavItem),
);

const DesktopNavItem = dynamic(() =>
  import('./components/desktop-nav-item').then(mod => mod.DesktopNavItem),
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

  return (
    <Box
      as='nav'
      id='nde-navigation'
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
        align='center'
      >
        <Flex flex={{ base: 1, md: 'auto' }} alignItems='center'>
          <Flex flex={1} justifyContent='flex-start'>
            <Logo href={NAVIGATION?.href} />
            {/* For desktop */}
            <Flex
              display={{ base: 'none', md: 'flex' }}
              ml={{ base: 6, lg: 10 }}
              flex={1}
              justifyContent='flex-end'
            >
              <Stack direction='row' spacing={{ base: 2, lg: 4 }}>
                {NAVIGATION.routes &&
                  NAVIGATION.routes.map(navItem => (
                    <DesktopNavItem key={navItem.label} {...navItem} />
                  ))}
              </Stack>
            </Flex>
          </Flex>

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
      </Flex>
      {/* Popout navigation in mobile mode */}
      <Box
        borderRadius='semi'
        boxShadow='base'
        overflow='hidden'
        display={{ base: 'block', md: 'none' }}
      >
        <Collapse in={isOpen} animateOpacity>
          <Stack bg='white' p={2} alignItems='end'>
            {NAVIGATION.routes &&
              NAVIGATION.routes.map(navItem => (
                <MobileNavItem key={navItem.label} {...navItem} />
              ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};
