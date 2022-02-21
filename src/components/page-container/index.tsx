import {Flex, Navigation, Footer} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';
import Head from 'next/head';
import {Html} from 'next/document';

export interface NavItem {
  label: string;
  subLabel?: string;
  routes?: Array<NavItem>;
  href?: string;
  isExternal?: boolean;
}

interface PageContainerProps {
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
  return (
    <>
      <Head>
        <title>NDE Portal {title && ` | ${title}`}</title>
        <meta name='description' content={metaDescription} />
        <link rel='icon' href='/favicon.png' />
      </Head>

      <Flex as={'main'} w={'100%'} flexDirection={'column'}>
        {hasNavigation && <Navigation navItems={navItems.routes} />}
        <Flex
          bg={'niaid.100'}
          minH={'80vh'}
          px={{base: '4', sm: '6', xl: '8'}}
          {...rest}
        >
          {children}
        </Flex>
        <Footer navigation={footerItems.routes} />
      </Flex>
    </>
  );
};

export default PageContainer;
