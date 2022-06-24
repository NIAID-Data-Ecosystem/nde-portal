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
import { SearchBar } from 'src/components/search-bar';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
  disableSearchBar?: boolean;
}

export const NAV_HEIGHT = { base: '105px', sm: '77px', md: '89px' };

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
  disableSearchBar,
  ...rest
}) => {
  const topNavigation = navConfig as NavigationProps['navigation'];
  const footerNavigation = footerConfig as FooterProps['navigation'];

  const ref = useRef<HTMLDivElement>(null);

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
          href: `${env.BASE_URL}${r['href']}${
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

      <Flex as={'main'} w={'100%'} flexDirection={'column'} minW={300}>
        {topNavigation && hasNavigation && (
          // Sticky Nav Bar.
          <Box
            id='nav-wrapper'
            ref={ref}
            position='sticky'
            top={0}
            w='100%'
            zIndex={100}
            minW={300}
          >
            <Navigation
              navigation={{
                ...topNavigation,
                routes: [...prefixPortalRoutes(topNavigation.routes)],
              }}
            />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id={'pagebody'} position='relative'>
          <Notice />
          {!disableSearchBar && <SearchBar />}
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
