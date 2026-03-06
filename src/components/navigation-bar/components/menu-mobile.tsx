import React from 'react';
import {
  Box,
  Collapse,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaAngleRight,
  FaAngleDown,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { TransformedNavigationMenu } from '../types';
import { MobileAuthAction } from './nav-auth-action';

const MobileLinkRightIcon = () => {
  return (
    <Icon
      as={FaAngleRight}
      className='icon'
      ml='10px'
      transform='translateX(-10px)'
      transition='all .3s ease'
      sx={{ '> *': { color: 'niaid.700' } }}
      w={3}
      h={3}
    />
  );
};

const MobileLinkLabel = ({
  label,
  isExternal,
}: {
  label: string;
  isExternal?: boolean;
}) => {
  return (
    <Flex alignItems='center' gap={2}>
      <Text className='label' fontWeight={600}>
        {label}
      </Text>
      {isExternal && (
        <Icon as={FaArrowUpRightFromSquare} w={3} h={3} color='niaid.700' />
      )}
    </Flex>
  );
};

const MobileNavLink = ({
  label,
  href,
  isExternal,
}: {
  label: string;
  href: string;
  isExternal?: boolean;
}) => {
  return (
    <Link
      px={4}
      py={2}
      href={href}
      w='100%'
      color='niaid.800'
      variant='unstyled'
      rounded='md'
      _hover={{
        bg: 'niaid.50',
        color: 'niaid.600',
        '.label': { color: 'niaid.500' },
        '.icon': { opacity: 1, transform: 'translateX(0)' },
      }}
      _visited={{ color: 'niaid.800' }}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <Flex opacity={1} justify='space-between' align='center'>
        <MobileLinkLabel label={label} isExternal={isExternal} />
        <MobileLinkRightIcon />
      </Flex>
    </Link>
  );
};

const MobileToggleIcon = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <Icon
      sx={{ '> *': { color: 'niaid.700' } }}
      as={FaAngleDown}
      transition='all .25s ease-in-out'
      transform={
        isOpen ? 'translateX(-10px) rotate(180deg)' : 'translateX(-10px)'
      }
      w={3}
      h={3}
    />
  );
};

const MobileNavToggle = ({
  label,
  isOpen,
  hasRoutes,
}: {
  label: string;
  isOpen: boolean;
  hasRoutes: boolean;
}) => {
  return (
    <Flex
      as='button'
      px={4}
      py={2}
      justify='space-between'
      align='center'
      w='100%'
      color='gray.900'
      rounded='md'
      _hover={{ bg: 'niaid.50', color: 'gray.900' }}
    >
      <Flex justify='space-between' align='center'>
        <Text fontWeight={600} color='gray.700'>
          {label}
        </Text>
      </Flex>
      {hasRoutes && <MobileToggleIcon isOpen={isOpen} />}
    </Flex>
  );
};

const MobileChildrenNav = ({
  routes,
}: {
  routes: TransformedNavigationMenu[];
}) => {
  return (
    <Stack
      mt={0}
      pl={2}
      ml={2}
      borderLeft={2}
      borderStyle='solid'
      borderColor='gray.200'
      align='start'
    >
      {routes.map(route => (
        <MobileNavItem key={`${route.href ?? route.label}`} {...route} />
      ))}
    </Stack>
  );
};

export const MobileNavItem = ({
  label,
  routes,
  href,
  isExternal,
}: TransformedNavigationMenu) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack
      w='100%'
      spacing={2}
      onClick={routes ? onToggle : undefined}
      cursor={routes ? 'pointer' : 'default'}
    >
      {href ? (
        <MobileNavLink label={label} href={href} isExternal={isExternal} />
      ) : (
        <MobileNavToggle
          label={label}
          isOpen={isOpen}
          hasRoutes={Boolean(routes)}
        />
      )}

      {routes?.length ? (
        <Collapse in={isOpen} animateOpacity>
          <MobileChildrenNav routes={routes} />
        </Collapse>
      ) : null}
    </Stack>
  );
};

export const MobileSubMenu = ({
  isOpen,
  navigation,
}: {
  isOpen: boolean;
  navigation: TransformedNavigationMenu[];
}) => {
  return (
    <Box borderRadius='semi' boxShadow='base' overflow='hidden'>
      <Collapse in={isOpen} animateOpacity>
        <Stack bg='white' p={2} alignItems='end'>
          {navigation &&
            navigation.map(navItem => (
              <MobileNavItem key={navItem.label} {...navItem} />
            ))}
          <MobileAuthAction />
        </Stack>
      </Collapse>
    </Box>
  );
};
