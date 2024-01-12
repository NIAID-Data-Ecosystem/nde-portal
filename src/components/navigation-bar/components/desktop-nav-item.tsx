import React from 'react';
import {
  Box,
  Button,
  Flex,
  Link,
  Text,
  Stack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { FaCaretDown, FaChevronRight } from 'react-icons/fa6';
import { RouteProps } from '..';

// Desktop Navigation link styles
export const DesktopNavItem = ({
  label,
  routes,
  href,
  isExternal,
}: RouteProps) => {
  if (!routes) {
    return (
      <Link
        href={href ?? '#'}
        px={2}
        fontSize='md'
        fontWeight={500}
        color='white'
        _visited={{ color: 'white', _hover: { color: 'white' } }}
        _hover={{
          opacity: 0.85,
          color: 'white',
        }}
        variant='unstyled'
        cursor='pointer'
        whiteSpace='nowrap'
        display='flex'
        w='auto'
        h='100%'
        justifyContent='center'
        alignItems='center'
        textAlign='center'
        target={isExternal ? '_blank' : '_self'}
      >
        {label}
      </Link>
    );
  }
  return (
    <>
      <Popover trigger='click' placement='bottom-start' autoFocus closeOnEsc>
        <PopoverTrigger>
          <Button
            as='a'
            __css={{ padding: 0 }}
            px={2}
            display='flex'
            href={href ?? '#'}
            fontSize='md'
            fontWeight={500}
            color='white'
            _visited={{ color: 'white' }}
            _hover={{
              opacity: 0.85,
              color: 'white',
            }}
            variant='unstyled'
            cursor='pointer'
            alignItems='center'
            justifyContent='center'
            h='100%'
          >
            {label}
            {routes && <Icon as={FaCaretDown} ml={1} w={4} h={4} />}
          </Button>
        </PopoverTrigger>

        {routes && (
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
                  <DesktopSubNav key={route.label} {...route} />
                ))}
              </Stack>
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
};

// Desktop Navigation sub menu for nested links
const DesktopSubNav = ({ label, href, subLabel, isExternal }: RouteProps) => {
  return (
    <Link
      role='tab'
      href={href}
      p={2}
      color='tertiary.800'
      variant='unstyled'
      rounded='md'
      _hover={{
        bg: 'tertiary.50',
        color: 'tertiary.600',
        '.label': { color: 'tertiary.600' },
        '.icon': { opacity: '100%', transform: 'translateX(0)' },
      }}
      _visited={{ color: 'tertiary.800' }}
      target={isExternal ? '_blank' : '_self'}
    >
      <Flex justifyContent='space-between'>
        <Box>
          <Text
            className='label'
            transition='all .3s ease'
            _groupHover={{ color: 'tertiary.700' }}
            fontWeight={600}
          >
            {label}
          </Text>
          <Text fontSize='sm' color='text.body' lineHeight='short'>
            {subLabel}
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
              '> *': { color: 'tertiary.700' },
            }}
            w={3}
            h={3}
            as={FaChevronRight}
          />
        </Flex>
      </Flex>
    </Link>
  );
};
