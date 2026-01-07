import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  Text,
} from '@chakra-ui/react';
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
  colorScheme = DEFAULT_COLOR_SCHEME,
}: SidebarMobileProps) => {
  return (
    <Menu matchWidth>
      <Flex bg='white'>
        <MenuButton
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
            <Icon as={FaArrowsUpDown} />
          </Flex>
        </MenuButton>
      </Flex>
      <MenuList w='100%'>
        {isLoading && (
          <MenuItem>
            <LoadingSpinner isLoading={isLoading} />
          </MenuItem>
        )}
        {sections?.map(category => (
          <MenuGroup key={category.id} title={category.name}>
            {category.items.map(item => {
              if (!item?.slug) return null;
              const isSelected = selectedSlug === item.slug;
              return (
                <NextLink
                  key={item.id}
                  style={{ display: 'flex', width: '100%' }}
                  href={item.href}
                >
                  <MenuItem
                    pl={6}
                    color={
                      isSelected ? `${colorScheme}.600!important` : 'inherit'
                    }
                    bg={isSelected ? `${colorScheme}.100` : 'transparent'}
                  >
                    <Text fontSize='sm' color='inherit'>
                      {item.name}
                    </Text>
                  </MenuItem>
                </NextLink>
              );
            })}
          </MenuGroup>
        ))}
      </MenuList>
    </Menu>
  );
};
