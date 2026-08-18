import { Flex, Icon, Menu, Text } from '@chakra-ui/react';
import { FaArrowsUpDown } from 'react-icons/fa6';
import LoadingSpinner from 'src/components/loading';
import NextLink from 'next/link';
import type { SidebarMobileProps } from '../../types';
import { DEFAULT_COLOR_SCHEME } from '../../constants';

export const SidebarMobile = ({
  isLoading,
  menuTitle,
  sections,
  selectedSlug,
  colorPalette = DEFAULT_COLOR_SCHEME,
}: SidebarMobileProps) => {
  return (
    <Menu matchWidth>
      <Flex bg='white'>
        <Menu.Trigger
          bg='blackAlpha.100'
          borderRadius='semi'
          color='page.placeholder'
          mx={2}
          my={2}
          flex={1}
          _hover={{ color: 'text.body' }}
        >
          <Flex px={4} py={2} alignItems='center' justifyContent='center'>
            <Text as='span' size='sm' flex={1} color='inherit'>
              {menuTitle || 'Documentation Menu'}
            </Text>
            <Icon asChild>
              <FaArrowsUpDown />
            </Icon>
          </Flex>
        </Menu.Trigger>
      </Flex>
      <Menu.Content w='100%'>
        {isLoading && (
          <Menu.Item>
            <LoadingSpinner isLoading={isLoading} />
          </Menu.Item>
        )}
        {sections?.map(category => (
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
                  pl={6}
                  color={
                    isSelected ? `${colorPalette}.600!important` : 'inherit'
                  }
                  bg={isSelected ? `${colorPalette}.100` : 'transparent'}
                  asChild
                >
                  <NextLink key={item.id} href={item.href}>
                    <Text fontSize='sm' color='inherit'>
                      {item.name}
                    </Text>
                  </NextLink>
                </Menu.Item>
              );
            })}
          </Menu.ItemGroup>
        ))}
      </Menu.Content>
    </Menu>
  );
};
