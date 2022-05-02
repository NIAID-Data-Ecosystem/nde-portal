import {useEffect, useRef, useState} from 'react';
import {
  Box,
  Flex,
  Footer,
  FlexProps,
  Navigation,
  useDimensions,
} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';
import Head from 'next/head';
import Notice from './notice';
import {assetPrefix, basePath} from 'next.config';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
}

export const NAV_HEIGHT = {base: '105px', sm: '77px', md: '89px'};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
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
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        ></meta>
      </Head>

      <Flex as={'main'} w={'100%'} flexDirection={'column'} minW={300}>
        {hasNavigation && (
          // Sticky Nav Bar.
          <Box
            id='nav-wrapper'
            ref={ref}
            position='fixed'
            w='100%'
            zIndex={100}
            minW={300}
          >
            <Navigation navItems={formatRoute(navItems.routes)} />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box
          id={'pagebody'}
          // mt={`${dimensions?.borderBox.height || 0}px`}
          mt={NAV_HEIGHT}
          position='relative'
        >
          <Notice />
          {children}
          <Footer navigation={formatRoute(footerItems.routes)} />
        </Box>
      </Flex>
    </>
  );
};
