import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HeadingProps,
  ListItem,
  ListProps,
  SimpleGrid,
  Stack,
  TextProps,
  UnorderedList,
} from '@chakra-ui/react';
import { Logo } from 'src/components/logos';
import NAVIGATION from './routes.json';
import { FooterLink, FooterSocialLinks } from './components/link';
import { useMetadata } from 'src/hooks/api/useMetadata';

export interface ListHeaderProps extends TextProps {}

const LinksHeading: React.FC<ListHeaderProps> = ({ children, ...props }) => {
  return (
    <Heading
      as='h2'
      size='h5'
      fontFamily='body'
      color='white'
      fontWeight='medium'
      {...props}
    >
      {children}
    </Heading>
  );
};

export interface FooterItem {
  label: string;
  type?: string;
  routes?: FooterItem[];
  href?: string;
  subLabel?: string;
  isExternal?: boolean;
}

export interface FooterProps {
  navigation: {
    href: string;
    contact: FooterItem;
    routes: FooterItem[];
    lastUpdate?: FooterItem[];
  };
}

// Contact Links such as social media, email etc.

export const Footer = () => {
  interface NestedList {
    label: string;
    routes?: FooterItem[];
    listProps?: ListProps;
    headingProps?: HeadingProps;
  }

  const NestedList: React.FC<NestedList> = ({
    label,
    routes,
    listProps,
    headingProps,
  }) => {
    return (
      <>
        <LinksHeading
          as='h3'
          size='md'
          mb={3}
          color='whiteAlpha.800'
          {...headingProps}
        >
          {label}
        </LinksHeading>
        <UnorderedList ml={0} {...listProps}>
          {routes &&
            routes.map(route => {
              if (route.routes) {
                return (
                  <NestedList
                    key={route.label}
                    label={route.label}
                    routes={route.routes}
                    headingProps={{
                      as: 'h4',
                      size: 'sm',
                    }}
                  />
                );
              }
              return (
                <ListItem key={route.label}>
                  {route.href && (
                    <FooterLink
                      href={route.href}
                      isExternal={route.isExternal ?? false}
                      variant='ghost'
                    >
                      {route.label}
                    </FooterLink>
                  )}
                </ListItem>
              );
            })}
        </UnorderedList>
      </>
    );
  };

  const { data } = useMetadata();
  const lastDataHarvest = data?.build_date
    ? [
        {
          label: `Data harvested: ${data?.build_date.split('T')[0]}`,
          href: '/sources/',
        },
      ]
    : [];

  return (
    <Box
      as='footer'
      bg='gray.900'
      color='white'
      borderTop='0.25rem solid'
      borderColor='accent.bg'
      minW='300px'
      display={{ base: 'block', lg: 'flex' }}
      flexDirection='column'
    >
      <Stack p={6} alignItems={{ base: 'center', md: 'start' }} margin='0 auto'>
        <Box w='100%'>
          <Logo href={NAVIGATION?.href} />
          <SimpleGrid
            minChildWidth={{
              base: '100%',
              md: `${100 / (NAVIGATION?.routes?.length || 1)}%`,
              xl: `${1000 / (NAVIGATION?.routes?.length || 1)}px`,
            }}
            maxW='6xl'
            w='100%'
          >
            {(NAVIGATION?.routes as FooterProps['navigation']['routes'])?.map(
              (section, i) => {
                return (
                  <Box key={i} flex={i === 0 ? 2 : 1}>
                    {section.label && (
                      <LinksHeading mt={8}>{section.label}</LinksHeading>
                    )}
                    <UnorderedList ml={0} my={4}>
                      {section.routes &&
                        section.routes.map(
                          ({ href, label, routes, isExternal }) => {
                            return (
                              <ListItem
                                key={label}
                                alignItems='flex-start'
                                mt={1}
                                mb={3}
                                _hover={{
                                  svg: {
                                    opacity: '100%',
                                    transform: 'translateX(0)',
                                    transition: 'all .3s ease',
                                  },
                                }}
                              >
                                {href ? (
                                  <FooterLink
                                    href={href}
                                    isExternal={isExternal ?? false}
                                    variant='ghost'
                                  >
                                    {label}
                                  </FooterLink>
                                ) : (
                                  <NestedList label={label} routes={routes} />
                                )}
                              </ListItem>
                            );
                          },
                        )}
                    </UnorderedList>
                  </Box>
                );
              },
            )}
          </SimpleGrid>
        </Box>
      </Stack>
      <Box
        borderTopWidth={1}
        borderStyle='solid'
        bg='text.heading'
        borderColor='gray.700'
      >
        <Flex
          px={{ base: 0, sm: 4 }}
          py={{ base: 2, sm: 4 }}
          flexDirection={{ base: 'row', md: 'row' }}
          flexWrap='wrap'
        >
          <Flex
            flexDirection={{ base: 'column', lg: 'row' }}
            flexWrap='wrap'
            flex={1}
          >
            {NAVIGATION && NAVIGATION.contact && (
              <FooterSocialLinks routes={NAVIGATION.contact.routes} />
            )}
          </Flex>
          <Flex
            flexDirection={{ base: 'column', lg: 'row' }}
            flexWrap='wrap'
            flex={1}
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          >
            {NAVIGATION && NAVIGATION?.lastUpdate && (
              <FooterSocialLinks
                routes={[
                  ...NAVIGATION.lastUpdate,
                  {
                    label:
                      lastDataHarvest[0]?.label || 'Data harvested: 00-00-0000',
                    href: lastDataHarvest[0]?.href || '#',
                  },
                ]}
              />
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
