import {useEffect, useRef, useState} from 'react';
import {Box, Flex, Navigation, Footer, FlexProps} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';
import Head from 'next/head';

export interface NavItem {
  label: string;
  subLabel?: string;
  routes?: Array<NavItem>;
  href?: string;
  isExternal?: boolean;
}

export const PageContent: React.FC<FlexProps> = ({children, ...props}) => {
  return (
    <Flex
      bg={'page.alt'}
      minH={'80vh'}
      p={{base: '4', sm: '6', xl: '8'}}
      w={'100%'}
      {...props}
    >
      {children}
    </Flex>
  );
};

interface PageContainerProps extends FlexProps {
  hasNavigation: boolean;
  title?: string;
  metaDescription: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  title,
  metaDescription,
  ...rest
}) => {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeight(ref?.current?.clientHeight || 0);
  }, []);

  return (
    <>
      <Head>
        <title>NDE Portal {title && ` | ${title}`}</title>
        <meta name='description' content={metaDescription} />
        <link rel='icon' href='/favicon.png' />
      </Head>

      <Flex as={'main'} w={'100%'} flexDirection={'column'}>
        {hasNavigation && (
          // Sticky Nav Bar.
          <Box ref={ref} position='fixed' w='100%' zIndex={100}>
            <Navigation navItems={navItems.routes} />
          </Box>
        )}
        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Box id={'pagebody'} mt={`${height}px` || 0}>
          <PageContent {...rest}>{children}</PageContent>
          <Footer navigation={footerItems.routes} />
        </Box>
      </Flex>
    </>
  );
};

export default PageContainer;
