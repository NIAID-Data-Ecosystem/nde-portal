import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  List,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { UrlObject } from 'url';

const SidebarList: React.FC<FlexProps & { ['aria-label']: string }> = ({
  ['aria-label']: ariaLabel,
  children,
  ...props
}) => {
  return (
    <Flex
      as='nav'
      aria-label={ariaLabel}
      bg='bg.subtle'
      flex={1}
      flexDirection='column'
      display={{ base: 'none', md: 'flex' }}
      minWidth='380px'
      maxWidth='450px'
      {...props}
    >
      <List.Root as='ul' top={0} ml={0}>
        {children}
      </List.Root>
    </Flex>
  );
};

export const SidebarItem: React.FC<{
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  href: UrlObject | string;
  headingProps?: HeadingProps;
}> = ({ href, title, subTitle }) => {
  return (
    <List.Item
      asChild
      _hover={{ bg: 'gray.50' }}
      cursor='pointer'
      px={[2, 4, 6]}
      py={4}
      borderTop='1px solid'
      borderRight='1px solid'
      borderColor='gray.100'
    >
      <NextLink href={href}>
        {typeof title === 'string' ? (
          <Heading textStyle='h6' lineHeight='short' mb={1} {...props}>
            {title}
          </Heading>
        ) : (
          title
        )}

        {subTitle && (
          <Text fontSize='sm' lineHeight='short'>
            {subTitle}
          </Text>
        )}
      </NextLink>
    </List.Item>
  );
};

export const Sidebar = {
  List: SidebarList,
  Item: SidebarItem,
};
