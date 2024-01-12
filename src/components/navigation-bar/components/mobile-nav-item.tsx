import React from 'react';
import {
  Box,
  Flex,
  Link,
  Text,
  Stack,
  Collapse,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa6';
import { RouteProps } from '..';

// Mobile Navigation link styles
export const MobileNavItem = ({
  label,
  routes,
  href,
  isExternal,
}: RouteProps) => {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <Stack w='100%' spacing={2} onClick={routes && onToggle} cursor='pointer'>
      {href ? (
        <Link
          px={4}
          py={2}
          href={href}
          w='100%'
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
          <Flex opacity={1} justify='space-between' align='center'>
            <Text fontWeight={600}>{label}</Text>
            <Icon
              className='icon'
              ml='10px'
              transform='translateX(-10px)'
              transition='all .3s ease'
              sx={{
                '> *': { color: 'tertiary.700' },
              }}
              w={3}
              h={3}
              as={FaChevronRight}
            />
          </Flex>
        </Link>
      ) : (
        <Flex
          px={4}
          py={2}
          justify='space-between'
          align='center'
          w='100%'
          color='gray.900'
          rounded='md'
          _hover={{
            bg: 'tertiary.50',
            color: 'gray.900',
          }}
        >
          <Flex justify='space-between' align='center'>
            <Text fontWeight={600} color='gray.700'>
              {label}
            </Text>
          </Flex>
          {routes && (
            <Icon
              sx={{
                '> *': { color: 'tertiary.700' },
              }}
              as={FaChevronDown}
              transition={'all .25s ease-in-out'}
              transform={
                isOpen
                  ? 'translateX(-10px) rotate(180deg)'
                  : 'translateX(-10px)'
              }
              w={3}
              h={3}
            />
          )}
        </Flex>
      )}

      <Box>
        <Collapse in={isOpen} animateOpacity>
          <Stack
            mt={0}
            pl={2}
            ml={2}
            borderLeft={2}
            borderStyle='solid'
            borderColor='gray.200'
            align='start'
          >
            {routes &&
              routes.map(route => {
                return <MobileNavItem key={route.href} {...route} />;
              })}
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
};
