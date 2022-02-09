import {Flex, Navigation, Footer} from 'nde-design-system';
import navItems from 'configs/nav.json';
import footerItems from 'configs/footer.json';

export interface NavItem {
  label: string;
  subLabel?: string;
  routes?: Array<NavItem>;
  href?: string;
  isExternal?: boolean;
}

interface PageContainerProps {
  hasNavigation: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  hasNavigation,
  ...rest
}) => {
  return (
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
  );
};

export default PageContainer;
