import {useEffect, useRef, useState} from 'react';
import {Box, Flex, Navigation, Footer, FlexProps} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';
import Head from 'next/head';
import Notice from './notice';
import {basePath} from 'next.config';

interface PageContainerProps extends FlexProps {
  hasNavigation?: boolean;
  title: string;
  metaDescription: string;
}

/* [TO DO] Update nav + footer to accept children components. */

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
  ...rest
}) => {
  const [height, setHeight] = useState(90);
  const ref = useRef<HTMLDivElement>(null);

  // Handle height margin top needed when screen + nav resize.

  useEffect(() => {
    const handleResize = () => {
      setHeight(ref?.current?.clientHeight || 0);
    };
    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatRoute: any = (routes: any[]) => {
    return routes.map(r => {
      if ('routes' in r) {
        return formatRoute(r.routes);
      }
      return {...r, href: `${basePath}${r['href']}`};
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
          <Box ref={ref} position='fixed' w='100%' zIndex={100} minW={300}>
            <Navigation navItems={formatRoute(navItems.routes)} />
          </Box>
        )}

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id={'pagebody'} mt={`${height}px` || 0} position='relative'>
          <Notice />
          {children}
          <Footer navigation={formatRoute(footerItems.routes)} />
        </Box>
      </Flex>
    </>
  );
};
