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

export const SidebarList: React.FC<FlexProps & { ['aria-label']: string }> = ({
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

export const SidebarLabel: React.FC<HeadingProps> = ({
  children,
  ...props
}) => {
  return (
    <Heading textStyle='h6' lineHeight='short' mb={1} {...props}>
      {children}
    </Heading>
  );
};

export const SidebarItem: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  href: UrlObject | string;
  headingProps?: HeadingProps;
}> = ({ href, title, subtitle, ...props }) => {
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
          <SidebarLabel textStyle='h6' lineHeight='short' mb={1} {...props}>
            {title}
          </SidebarLabel>
        ) : (
          title
        )}

        {subtitle && (
          <Text fontSize='sm' lineHeight='short'>
            {subtitle}
          </Text>
        )}
      </NextLink>
    </List.Item>
  );
};
