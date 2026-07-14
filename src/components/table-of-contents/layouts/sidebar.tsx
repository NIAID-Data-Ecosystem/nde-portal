import {
  Box,
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
  // In-page hash anchors (e.g. `#source-slug`) are handled natively by the
  // browser. Routing them through `next/link` invokes the Next router, which
  // throws "Cancel rendering route" when navigations overlap (e.g. clicking
  // several items in quick succession) — so use a plain anchor for those.
  const isHashLink = typeof href === 'string' && href.startsWith('#');
  return (
    <ListItem
      _hover={{ bg: 'gray.50' }}
      cursor='pointer'
      borderTop='1px solid'
      borderRight='1px solid'
      borderColor='gray.100'
    >
      <Box
        as={isHashLink ? 'a' : NextLink}
        href={href}
        display='block'
        px={[2, 4, 6]}
        py={4}
      >
        {typeof label === 'string' ? <Label>{label}</Label> : label}

        {subLabel && (
          <Text fontSize='sm' lineHeight='short'>
            {subLabel}
          </Text>
        )}
      </Box>
    </ListItem>
  );
};

export const Label: React.FC<HeadingProps> = ({ children, ...props }) => {
  return (
    <Heading size='h6' lineHeight='short' mb={1} {...props}>
      {children}
    </Heading>
  );
};
