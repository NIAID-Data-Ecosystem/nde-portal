import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { UrlObject } from 'url';

export const Sidebar: React.FC<FlexProps & { ['aria-label']: string }> = ({
  ['aria-label']: ariaLabel,
  children,
  ...props
}) => {
  return (
    <Flex
      as='nav'
      aria-label={ariaLabel}
      bg='page.alt'
      flex={1}
      flexDirection='column'
      display={{ base: 'none', md: 'flex' }}
      minWidth='380px'
      maxW='450px'
      {...props}
    >
      <UnorderedList top={0} ml={0}>
        {children}
      </UnorderedList>
    </Flex>
  );
};

export const SidebarItem: React.FC<{
  label: React.ReactNode;
  subLabel?: React.ReactNode;
  href: UrlObject | string;
}> = ({ href, label, subLabel }) => {
  return (
    <NextLink href={href}>
      <ListItem
        _hover={{ bg: 'gray.50' }}
        cursor='pointer'
        px={[2, 4, 6]}
        py={4}
        borderTop='1px solid'
        borderRight='1px solid'
        borderColor='gray.100'
      >
        <Label>{label}</Label>

        {subLabel && (
          <Text fontSize='sm' lineHeight='short'>
            {subLabel}
          </Text>
        )}
      </ListItem>
    </NextLink>
  );
};

export const Label: React.FC<HeadingProps> = ({ children, ...props }) => {
  return (
    <Heading size='h6' lineHeight='short' mb={1} {...props}>
      {children}
    </Heading>
  );
};
