import React from 'react';
import {
  Box,
  Flex,
  Link,
  Text,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { FaAngleRight } from 'react-icons/fa6';
import { TransformedNavigationMenu } from '../types';

// Desktop Navigation sub menu for nested links
const DesktopSubNavItem = ({
  label,
  href,
  description,
  isExternal,
}: TransformedNavigationMenu) => {
  return (
    <Link
      role='tab'
      href={href}
      p={2}
      color='niaid.800'
      variant='unstyled'
      rounded='md'
      _hover={{
        bg: 'niaid.50',
        color: 'niaid.600',
        '.label': { color: 'niaid.500' },
        '.icon': { opacity: '100%', transform: 'translateX(0)' },
      }}
      _visited={{ color: 'niaid.800' }}
      target={isExternal ? '_blank' : '_self'}
    >
      <Flex justifyContent='space-between'>
        <Box>
          <Text
            className='label'
            transition='all .3s ease'
            _groupHover={{ color: 'niaid.700' }}
            fontWeight={600}
          >
            {label}
          </Text>
          <Text fontSize='sm' color='text.body' lineHeight='short' pr={1}>
            {description}
          </Text>
        </Box>
        <Flex
          className='icon'
          ml='10px'
          transition='all .3s ease'
          transform='translateX(-10px)'
          opacity={1}
          justify='flex-end'
          align='center'
        >
          <Icon
            sx={{
              '> *': { color: 'niaid.700' },
            }}
            w={3}
            h={3}
            as={FaAngleRight}
          />
        </Flex>
      </Flex>
    </Link>
  );
};

export const DesktopSubNav = ({
  routes,
}: {
  routes: TransformedNavigationMenu[];
}) => {
  if (!routes) return <></>;
  return (
    <PopoverContent
      border={0}
      boxShadow='xl'
      bg='white'
      py={2}
      rounded='xl'
      minW='sm'
    >
      <PopoverArrow />
      <PopoverBody>
        <Stack role='tablist'>
          {routes.map(route => (
            <DesktopSubNavItem key={route.label} {...route} />
          ))}
        </Stack>
      </PopoverBody>
    </PopoverContent>
  );
};
