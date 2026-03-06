import React from 'react';
import { Box, Flex, Link, Text, Icon } from '@chakra-ui/react';
import {
  FaAngleDown,
  FaAngleRight,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { TransformedNavigationMenu } from '../types';

// Constants
const iconColorStyle = { '> *': { color: 'niaid.700' } };

const getToggleTransform = (isOpen?: boolean) =>
  isOpen ? 'translateX(-10px) rotate(180deg)' : 'translateX(-10px)';

const MenuItemContent = ({
  label,
  description,
  isExternal,
}: {
  label: string;
  description?: string;
  isExternal?: boolean;
}): JSX.Element => {
  return (
    <Box>
      <Flex alignItems='center' gap={2}>
        <Text className='label' transition='all .3s ease' fontWeight={600}>
          {label}
        </Text>
        {isExternal && (
          <Icon
            as={FaArrowUpRightFromSquare}
            w={3}
            h={3}
            color='niaid.700'
            aria-label='Opens in new tab'
          />
        )}
      </Flex>
      {description && (
        <Text fontSize='sm' color='text.body' lineHeight='short' pr={1}>
          {description}
        </Text>
      )}
    </Box>
  );
};

const MenuItemArrowIcon = (): JSX.Element => {
  return (
    <Flex
      className='icon'
      ml='10px'
      transition='all .3s ease'
      transform='translateX(-10px)'
      justify='flex-end'
      align='center'
    >
      <Icon sx={iconColorStyle} w={3} h={3} as={FaAngleRight} />
    </Flex>
  );
};

const MenuItemToggleIcon = ({
  isOpen,
}: {
  isOpen?: TransformedNavigationMenu['isOpen'];
}): JSX.Element => {
  return (
    <Icon
      sx={iconColorStyle}
      as={FaAngleDown}
      transition='all .25s ease-in-out'
      transform={getToggleTransform(isOpen)}
      w={3}
      h={3}
    />
  );
};

export const NavMenuItem = ({
  label,
  href,
  description,
  isExternal,
  onClick,
  isOpen,
}: TransformedNavigationMenu): JSX.Element => {
  if (!href) {
    return (
      <Flex
        as='button'
        type='button'
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Close' : 'Open'} ${label} menu`}
        px={4}
        py={2}
        justify='space-between'
        align='center'
        w='100%'
        color='gray.900'
        rounded='md'
        _hover={{ bg: 'niaid.50', color: 'gray.900' }}
        onClick={onClick}
      >
        <MenuItemContent
          label={label}
          description={description}
          isExternal={isExternal}
        />
        <MenuItemToggleIcon isOpen={isOpen} />
      </Flex>
    );
  }
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      color='niaid.800'
      display='flex'
      justifyContent='space-between'
      px={4}
      py={2}
      rounded='md'
      variant='unstyled'
      _hover={{
        bg: 'niaid.50',
        color: 'niaid.600',
        '.label': { color: 'niaid.500' },
        '.icon': { transform: 'translateX(0)' },
      }}
      _visited={{ color: 'niaid.800' }}
      cursor='pointer'
      width='100%'
      gap={2}
    >
      <MenuItemContent
        label={label}
        description={description}
        isExternal={isExternal}
      />
      <MenuItemArrowIcon />
    </Link>
  );
};
