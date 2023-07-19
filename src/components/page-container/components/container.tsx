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
// import Notice from './notice';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { PageContent } from './content';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import NextLink from 'next/link';
import { useMetadata } from 'src/hooks/api';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
  keywords?: string;
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
          href: `${r['href']}${r['href'].slice(-1) === '/' ? '' : '/'}`,
        };
      }

      return {
        ...r,
        href: r['href'],
      };
    });
  };

  const { data } = useMetadata();
  const lastDataUpdate = data?.build_date
    ? [
        {
          label: `Data harvested: ${data?.build_date.split('T')[0]}`,
          href: '/sources/',
        },
      ]
    : [];

  return (
    <>
      <Head>
        <title>{`NIAID Data Discovery Portal ${title && ` | ${title}`}`}</title>
        <meta
          name='description'
          content='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        />
        <meta
          name='keywords'
          content='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
        />

        {/* og meta */}
        <meta
          property='og:url'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}`}
        />
        <meta property='og:title' content='NIAID Data Discovery Portal' />
        <meta
          property='og:description'
          content='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='NIAID Data Discovery Portal' />
        <meta
          property='og:image'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/preview.png`}
        />

        {/* twitter meta */}
        <meta property='twitter:title' content='NIAID Data Discovery Portal' />
        <meta property='twitter:description' content={metaDescription} />
        {/* <meta property='twitter:site' content='@NIAID' />
        <meta property='twitter:creator' content='@NIAID' /> */}
        <meta property='twitter:card' content='summary' />
        <meta
          property='twitter:image'
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/preview.png`}
        />
      </Head>

      <Flex
        as='main'
        w='100%'
        flexDirection='column'
        minW={300}
        minHeight='100vh'
      >
        {topNavigation && hasNavigation && (
          // Sticky Nav Bar.
          <Box id='nav-wrapper' w='100%' minW={300} zIndex='banner'>
            <Navigation
              navigation={{
                ...topNavigation,
                routes: [...prefixPortalRoutes(topNavigation.routes)],
              }}
            />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Flex id='pagebody' position='relative' flexDirection='column' flex={1}>
          {/* <Notice /> */}
          {!disableSearchBar && (
            <PageContent
              bg='#fff'
              minH='unset'
              borderBottom='1px solid'
              borderColor='gray.100'
              flexDirection='column'
              py={4}
              flex={1}
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
              lastUpdate:
                footerNavigation.lastUpdate || lastDataUpdate.length
                  ? [
                      ...(lastDataUpdate || []),
                      ...(footerNavigation.lastUpdate || []),
                    ]
                  : [],
            }}
          />
        </Flex>
      </Flex>
    </>
  );
};
