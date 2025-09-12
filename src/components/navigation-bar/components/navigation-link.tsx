import {
  Box,
  Flex,
  FlexProps,
  Icon,
  Link,
  LinkProps,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaAngleRight } from 'react-icons/fa6';

import { TransformedNavigationMenu } from '../types';

// Desktop Navigation sub menu for nested links
export const NavigationLinkWrapper = ({
  children,
  href,
  isExternal,
  ...props
}: LinkProps & Pick<TransformedNavigationMenu, 'href' | 'isExternal'>) => {
  return (
    <Link
      as={href ? 'a' : 'button'}
      role='tab'
      href={href}
      target={isExternal ? '_blank' : '_self'}
      variant='no-line'
      p={2}
      rounded='md'
      _hover={{
        bg: 'niaid.50',
        color: 'niaid.600',
      }}
      _visited={{ color: 'inherit' }}
      css={{
        '&:hover .label': {
          color: 'niaid.500',
        },
        '&:hover .icon': {
          opacity: 1,
          // Only apply transform if there is an href
          transform: href ? 'translateX(0)' : '',
        },
      }}
      {...props}
    >
      {children}
    </Link>
  );
};

// Desktop Navigation sub menu for nested links
export const NavigationLinkContent = ({
  label,
  description,
  getIcon = props => (
    <Icon {...props}>
      <FaAngleRight />
    </Icon>
  ),
  ...props
}: FlexProps &
  Pick<TransformedNavigationMenu, 'label' | 'description' | 'getIcon'>) => {
  return (
    <Flex justifyContent='space-between' flex={1} {...props}>
      <Box>
        <Text className='label' fontSize='md' fontWeight='semibold'>
          {label}
        </Text>
        <Text fontSize='sm' color='text.body' lineHeight='short' pr={1}>
          {description}
        </Text>
      </Box>
      <Flex
        className='icon'
        transition='all .3s ease'
        transform='translateX(-10px)'
        opacity={1}
        alignItems='center'
      >
        {getIcon({ w: 3, h: 3, color: 'niaid.700' })}
      </Flex>
    </Flex>
  );
};
