import {
  Box,
  Flex,
  Heading,
  HeadingProps,
  List,
  ListRootProps,
  SimpleGrid,
  Stack,
  TextProps,
} from '@chakra-ui/react';
import SITE_CONFIG from 'configs/site.config.json';
import React from 'react';
import { Logo } from 'src/components/logos';
import { useMetadata } from 'src/hooks/api/useMetadata';

import { SiteConfig } from '../page-container/types';
import { FooterLink, FooterSocialLinks } from './components/link';
import { FooterRoute } from './types';

export interface ListHeaderProps extends TextProps {}

const LinksHeading: React.FC<ListHeaderProps> = ({ children, ...props }) => {
  return (
    <Heading
      as='h2'
      textStyle='h5'
      fontFamily='body'
      color='white'
      fontWeight='medium'
      {...props}
    >
      {children}
    </Heading>
  );
};

// Contact Links such as social media, email etc.

export const Footer = () => {
  const siteConfig = SITE_CONFIG as SiteConfig;

  interface NestedList {
    label: string;
    routes?: FooterRoute[];
    listProps?: ListRootProps;
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
        <List.Root as='ul' ml={0} {...listProps}>
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
                <List.Item key={route.label}>
                  {route.href && (
                    <FooterLink
                      href={route.href}
                      isExternal={route.isExternal ?? false}
                      variant='plain'
                    >
                      {route.label}
                    </FooterLink>
                  )}
                </List.Item>
              );
            })}
        </List.Root>
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
      borderColor='accent.400'
      minW='300px'
      display={{ base: 'block', lg: 'flex' }}
      flexDirection='column'
    >
      <Stack p={6} alignItems={{ base: 'center', md: 'start' }} margin='0 auto'>
        <Box w='100%'>
          <Logo href='/' isLazy={true} />
          <SimpleGrid
            minChildWidth={{
              base: '100%',
              md: `${100 / (siteConfig.footer.sections.length || 1)}%`,
              xl: `${1000 / (siteConfig.footer.sections.length || 1)}px`,
            }}
            maxW='6xl'
            w='100%'
          >
            {siteConfig.footer.sections.map((section, i) => {
              return (
                <Box key={i} flex={i === 0 ? 2 : 1}>
                  {section.label && (
                    <LinksHeading mt={8}>{section.label}</LinksHeading>
                  )}
                  <List.Root as='ul' ml={0} my={4}>
                    {section.routes &&
                      section.routes.map(({ href, label, isExternal }) => {
                        return (
                          <List.Item
                            key={label}
                            alignItems='flex-start'
                            mt={1}
                            mb={3}
                          >
                            <FooterLink
                              href={href}
                              isExternal={isExternal ?? false}
                              variant='plain'
                            >
                              {label}
                            </FooterLink>
                          </List.Item>
                        );
                      })}
                  </List.Root>
                </Box>
              );
            })}
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
            {siteConfig.footer.contact && (
              <FooterSocialLinks routes={siteConfig.footer.contact.routes} />
            )}
          </Flex>
          <Flex
            flexDirection={{ base: 'column', lg: 'row' }}
            flexWrap='wrap'
            flex={1}
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
          >
            {siteConfig.footer.lastUpdate && (
              <FooterSocialLinks
                routes={[
                  ...siteConfig.footer.lastUpdate,
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
