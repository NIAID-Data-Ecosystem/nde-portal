import {
  Breadcrumb,
  BreadcrumbItem as ChakraBreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { FaAngleRight, FaHouse } from 'react-icons/fa6';
import { IconType } from 'react-icons';

interface BreadcrumbsProps {}

interface BreadcrumbItemProps {
  path: { name: string; icon?: IconType };
  isCurrentPage?: boolean;
}

export const BreadcrumbItem = ({
  isCurrentPage,
  path,
}: BreadcrumbItemProps) => {
  return (
    <HStack
      cursor={isCurrentPage ? 'default' : 'pointer'}
      alignItems='center'
      spacing={2}
      color={isCurrentPage ? 'gray.800' : 'niaid.500'}
      py={1}
      px={2}
      _hover={{
        color: isCurrentPage ? 'gray.800' : 'link.color',
        textDecoration: 'none',
        borderRadius: 'semi',
        bg: isCurrentPage ? 'transparent' : 'blue.50',
      }}
    >
      {path?.icon && (
        <Icon as={path.icon} boxSize={4} mb={0.5} fill='niaid.500' />
      )}
      <Text
        lineHeight='shorter'
        noOfLines={1}
        fontSize='sm'
        fontWeight='semibold'
        color='inherit'
        opacity={isCurrentPage ? 0.9 : 1}
      >
        {path.name}
      </Text>
    </HStack>
  );
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const pathSegments = segments.map((path, idx) => {
    const name = path
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/(?:^|\s)\S/g, a => a.toUpperCase());
    const last = idx === 0 ? path : segments.slice(0, idx + 1).join('/');
    return {
      name,
      route: `/${last}`,
    };
  });

  if (!pathSegments.length) return null;

  if (pathname === '/resources') {
    // Since `/resources` is not nested within `/search` in the route, we need to hardcode the search breadcrumb.
    // We leverage the router query field to determine the referrer path (which is set in the search results page). If the user is not coming from the search results page, we default to `/search`.

    pathSegments.unshift({
      name: 'Search',
      route:
        typeof router.query.referrerPath === 'string'
          ? router.query.referrerPath
          : '/search',
    });
  }
  return (
    <Flex px={6} py={2}>
      <Breadcrumb
        spacing={1}
        alignItems='center'
        separator={
          <Flex>
            <Icon as={FaAngleRight} color='gray.400' boxSize={3} />
          </Flex>
        }
      >
        {/* home */}
        <ChakraBreadcrumbItem key='home-page'>
          <BreadcrumbLink href='/'>
            <BreadcrumbItem
              key='home-page'
              path={{
                name: 'Home',
                icon: FaHouse,
              }}
            />
          </BreadcrumbLink>
        </ChakraBreadcrumbItem>

        {pathSegments.map((path, idx) => {
          const isCurrentPage = idx === pathSegments.length - 1;
          return (
            <ChakraBreadcrumbItem key={path.name} isCurrentPage={isCurrentPage}>
              <BreadcrumbLink href={path.route}>
                <BreadcrumbItem
                  key={path.name}
                  isCurrentPage={isCurrentPage}
                  path={path}
                />
              </BreadcrumbLink>
            </ChakraBreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Flex>
  );
};
