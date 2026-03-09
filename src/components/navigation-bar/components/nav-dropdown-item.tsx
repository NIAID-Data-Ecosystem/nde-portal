import React from 'react';
import { Box, Flex, Link, Text, Icon } from '@chakra-ui/react';
import {
  FaAngleDown,
  FaAngleRight,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { TransformedNavigationDropdown } from '../types';

/*
 * NavDropdownItem — A single item inside a dropdown or mobile accordion dropdown.
 *
 * Renders in one of two modes:
 *   1. **Link mode** (when `href` is provided) — an anchor that navigates
 *      to a page, with a hover-reveal arrow icon.
 *   2. **Toggle mode** (when `href` is absent) — a button that expands /
 *      collapses a nested dropdown, with a rotating chevron.
 *
 * Sub-components (internal):
 *   - DropdownItemContent: label text + optional description + external-link icon.
 *   - DropdownItemArrowIcon: right-pointing arrow revealed on link hover.
 *   - DropdownItemToggleIcon: chevron that rotates when a dropdown is open.
 */

//** Shared styles

const ICON_COLOR = { '> *': { color: 'niaid.700' } };

const SHARED_DROPDOWN_ITEM_STYLES = {
  display: 'flex',
  px: 2,
  py: 2,
  rounded: 'md',
  w: '100%',
  justify: 'space-between',
  align: 'center',
};

/** Label + optional description, with an external-link icon when applicable. */
const DropdownItemContent = ({
  label,
  description,
  isExternal,
  icon,
}: Pick<
  TransformedNavigationDropdown,
  'label' | 'description' | 'isExternal' | 'icon'
>): JSX.Element => (
  <Box flex={1}>
    <Flex alignItems='center' gap={2}>
      {icon && (
        <Icon as={icon} w={5} h={5} color='niaid.700' aria-hidden='true' />
      )}
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
      <Text
        fontSize='sm'
        color='text.body'
        lineHeight='short'
        pr={1}
        textAlign='left'
      >
        {description}
      </Text>
    )}
  </Box>
);

/** Right-arrow icon that slides in on link hover (see parent _hover styles). */
const DropdownItemArrowIcon = (): JSX.Element => (
  <Flex
    className='icon'
    ml='10px'
    transition='all .3s ease'
    transform='translateX(-10px)'
    justify='flex-end'
    align='center'
  >
    <Icon sx={ICON_COLOR} w={3} h={3} as={FaAngleRight} />
  </Flex>
);

/** Down-chevron that rotates 180° when the dropdown is expanded. */
const DropdownItemToggleIcon = ({
  isOpen,
}: {
  isOpen?: boolean;
}): JSX.Element => (
  <Icon
    sx={ICON_COLOR}
    as={FaAngleDown}
    transition='all .25s ease-in-out'
    transform={
      isOpen ? 'translateX(-10px) rotate(180deg)' : 'translateX(-10px)'
    }
    w={3}
    h={3}
  />
);

export const NavDropdownItem = ({
  label,
  href,
  icon,
  description,
  isExternal,
  onClick,
  isOpen,
}: TransformedNavigationDropdown): JSX.Element => {
  // Toggle mode — renders a button that opens/closes a dropdown.
  if (!href) {
    return (
      <Flex
        as='button'
        type='button'
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Close' : 'Open'} ${label} dropdown`}
        {...SHARED_DROPDOWN_ITEM_STYLES}
        color='gray.900'
        _hover={{ bg: 'niaid.50', color: 'gray.900' }}
        onClick={onClick}
      >
        <DropdownItemContent
          label={label}
          icon={icon}
          description={description}
          isExternal={isExternal}
        />
        <DropdownItemToggleIcon isOpen={isOpen} />
      </Flex>
    );
  }

  // Link mode — renders an anchor that navigates to a page.
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      color='niaid.800'
      {...SHARED_DROPDOWN_ITEM_STYLES}
      _hover={{
        bg: 'niaid.50',
        color: 'niaid.600',
        '.label': { color: 'niaid.500' },
        '.icon': { transform: 'translateX(0)' },
      }}
      _visited={{ color: 'niaid.800' }}
      cursor='pointer'
      gap={2}
    >
      <DropdownItemContent
        label={label}
        description={description}
        isExternal={isExternal}
        icon={icon}
      />
      <DropdownItemArrowIcon />
    </Link>
  );
};
