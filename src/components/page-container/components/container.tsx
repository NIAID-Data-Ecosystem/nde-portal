import { useRef } from 'react';
import {
  Box,
  Flex,
  Footer,
  FlexProps,
  Navigation,
  FooterItem,
  FooterProps,
  NavigationProps,
} from 'nde-design-system';
import navConfig from 'configs/nav.json';
import footerConfig from 'configs/footer.json';
import Head from 'next/head';
import Notice from './notice';
import { env } from 'next.config';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { PageContent } from './content';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import NextLink from 'next/link';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
  disableSearchBar?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
  disableSearchBar,
}) => {
  const topNavigation = navConfig as NavigationProps['navigation'];
  const footerNavigation = footerConfig as FooterProps['navigation'];

  const prefixPortalRoutes = (routes: FooterItem[]): FooterItem[] => {
    return routes.map(r => {
      if (r?.routes) {
        return { ...r, routes: prefixPortalRoutes(r.routes) };
      }
      if (!r['href']) {
        return r;
      }
      // if relative link, prefix with backslash
      if (r['href'].charAt(0) === '/') {
        return {
          ...r,
          href: `${env?.BASE_URL}${r['href']}${
            r['href'].slice(-1) === '/' ? '' : '/'
          }`,
        };
      }

      return {
        ...r,
        href: r['href'],
      };
    });
  };

  return (
    <>
      <Head>
        <title>NDE Portal {title && ` | ${title}`}</title>
        <meta name='description' content={metaDescription} />
      </Head>

      <Flex as='main' w='100%' flexDirection='column' minW={300}>
        {topNavigation && hasNavigation && (
          // Sticky Nav Bar.
          <Box id='nav-wrapper' w='100%' minW={300}>
            <Navigation
              navigation={{
                ...topNavigation,
                routes: [...prefixPortalRoutes(topNavigation.routes)],
              }}
            />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id='pagebody' position='relative'>
          <Notice />
          {!disableSearchBar && (
            <PageContent
              bg='#fff'
              minH='unset'
              borderBottom='1px solid'
              borderColor='gray.100'
              flexDirection='column'
              py={4}
            >
              <Flex w='100%' justifyContent='flex-end' mb={2}>
                <NextLink href={{ pathname: 'advanced-search' }} passHref>
                  <Box>
                    <AdvancedSearchOpen onClick={() => {}} />
                  </Box>
                </NextLink>
              </Flex>
              <SearchBarWithDropdown
                ariaLabel='Search for datasets'
                placeholder='Search for datasets'
                size='md'
              />
            </PageContent>
          )}
          {children}
          <Footer
            navigation={{
              ...footerNavigation,
              routes: [...prefixPortalRoutes(footerConfig.routes)],
            }}
          />
        </Box>
      </Flex>
    </>
  );
};
