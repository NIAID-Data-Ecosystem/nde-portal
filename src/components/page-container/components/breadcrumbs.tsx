import { IconType } from 'react-icons';
import { FaAngleRight, FaHouse } from 'react-icons/fa6';
import {
  Breadcrumb,
  BreadcrumbItem as ChakraBreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';
import { getSafeInternalPath } from '../helpers';

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

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ segments }) => {
  // Drop any segment whose route isn't a path on this site, so an unvalidated
  // value (e.g. a `javascript:` URI) can never reach a link's href.
  const safeSegments = segments.flatMap(segment => {
    const route = getSafeInternalPath(segment.route);
    return route ? [{ ...segment, route }] : [];
  });

  if (!safeSegments.length) return null;

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

        {safeSegments.map((path, idx) => {
          const isCurrentPage = idx === safeSegments.length - 1;
          return (
            <ChakraBreadcrumbItem
              key={path.name + idx}
              isCurrentPage={isCurrentPage}
            >
              <BreadcrumbLink href={path.route}>
                <BreadcrumbItem isCurrentPage={isCurrentPage} path={path} />
              </BreadcrumbLink>
            </ChakraBreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Flex>
  );
};
