import {useRef} from 'react';
import {Box, Flex, Footer, FlexProps, Navigation} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';
import Head from 'next/head';
import Notice from './notice';
import {basePath} from 'next.config';
import {SearchBar} from 'src/components/search-bar';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
  disableSearchBar?: boolean;
}

export const NAV_HEIGHT = {base: '105px', sm: '77px', md: '89px'};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
  disableSearchBar,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const formatRoute: any = (routes: any[]) => {
    return routes.map(r => {
      if ('routes' in r) {
        return {...r, routes: formatRoute(r.routes)};
      }
      return {
        ...r,
        href: `${basePath}${r['href']}${
          r['href'].slice(-1) === '/' ? '' : '/'
        }`,
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
        {hasNavigation && (
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
            <Navigation navItems={formatRoute(navItems.routes)} />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id={'pagebody'} position='relative'>
          <Notice />
          {!disableSearchBar && <SearchBar />}
          {children}
          <Footer navigation={formatRoute(footerItems.routes)} />
        </Box>
      </Flex>
    </>
  );
};
