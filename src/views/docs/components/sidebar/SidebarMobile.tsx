import { Flex, Icon, Menu, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaArrowsUpDown } from 'react-icons/fa6';

import { DEFAULT_COLOR_SCHEME } from '../../constants';
import type { SidebarMobileProps } from '../../types';

export const SidebarMobile = ({
  loading,
  menuTitle,
  sections,
  selectedSlug,
  colorPalette = DEFAULT_COLOR_SCHEME,
}: SidebarMobileProps) => {
  return (
    <Menu.Root>
      <Flex bg='white'>
        <Menu.Trigger
          bg='blackAlpha.100'
          borderRadius='semi'
          color='text.placeholder'
          mx={2}
          my={2}
          flex={1}
          _hover={{ color: 'text.body' }}
          disabled={loading || !sections?.length}
        >
          <Flex px={4} py={2} alignItems='center' justifyContent='center'>
            <Text as='span' fontSize='sm' flex={1} color='inherit'>
              {menuTitle || 'Documentation Menu'}
            </Text>
            <Icon>
              <FaArrowsUpDown />
            </Icon>
          </Flex>
        </Menu.Trigger>
      </Flex>
      <Menu.Content w='100%'>
        {!loading &&
          sections?.map(category => (
            <Menu.ItemGroup key={category.id} title={category.name}>
              {category.items.map(item => {
                if (!item?.slug) return null;
                const isSelected = selectedSlug === item.slug;
                return (
                  // Compose the link onto the Menu.Item so the `menuitem` role is on
                  // the anchor itself. Wrapping a Menu.Item in NextLink instead puts
                  // a bare <a> as a direct child of role="menu", which fails axe's
                  // `aria-required-children` (a menu may only contain menuitems).
                  <Menu.Item
                    key={item.id}
                    pl={6}
                    color={
                      isSelected ? `${colorPalette}.600!important` : 'inherit'
                    }
                    bg={isSelected ? `${colorPalette}.100` : 'transparent'}
                    value={item.name}
                    asChild
                    fontSize='sm'
                  >
                    <NextLink href={item.href}>{item.name}</NextLink>
                  </Menu.Item>
                );
              })}
            </Menu.ItemGroup>
          ))}
      </Menu.Content>
    </Menu.Root>
  );
};
