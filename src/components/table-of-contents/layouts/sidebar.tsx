import {
  Box,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  List,
  Text,
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
      bg='bg.alt'
      flex={1}
      flexDirection='column'
      display={{ base: 'none', md: 'block' }}
      minWidth='330px'
      maxW='450px'
      minHeight='100vh'
      height='100%'
      {...props}
    >
      <List.Root as='ul' top={0} pl={0}>
        {children}
      </List.Root>
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
  const content = (
    <>
      {typeof label === 'string' ? <Label>{label}</Label> : label}
      {subLabel && (
        <Text fontSize='sm' lineHeight='moderate'>
          {subLabel}
        </Text>
      )}
    </>
  );
  return (
    <List.Item
      _hover={{ bg: 'whiteAlpha.800' }}
      cursor='pointer'
      borderTop='1px solid'
      borderRight='1px solid'
      borderColor='gray.200'
    >
      <Box display='block' px={[2, 4, 6]} py={4} asChild>
        {isHashLink ? (
          <a href={href}>{content}</a>
        ) : (
          <NextLink href={href}>{content}</NextLink>
        )}
      </Box>
    </List.Item>
  );
};

export const Label: React.FC<HeadingProps> = ({ children, ...props }) => {
  return (
    <Heading size='h6' lineHeight='moderate' mb={1} {...props}>
      {children}
    </Heading>
  );
};
