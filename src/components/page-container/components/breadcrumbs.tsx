import { Breadcrumb, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { FaAngleRight, FaHouse } from 'react-icons/fa6';

import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';

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
      gap={2}
      color={isCurrentPage ? 'gray.800' : 'niaid.500'}
      py={1}
      px={2}
      _hover={{
        color: isCurrentPage ? 'gray.800' : 'link',
        textDecoration: 'none',
        borderRadius: 'semi',
        bg: isCurrentPage ? 'transparent' : 'blue.50',
      }}
    >
      {path?.icon && (
        <Icon boxSize={4} mb={0.5} fill='niaid.500' asChild>
          <path.icon />
        </Icon>
      )}
      <Text
        lineHeight='shorter'
        lineClamp={1}
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
  if (!segments.length) return null;

  return (
    <Flex px={6} py={2}>
      <Breadcrumb.Root alignItems='center'>
        <Breadcrumb.List gap={1}>
          {/* home */}
          <Breadcrumb.Item key='home-page'>
            <Breadcrumb.Link href='/'>
              <BreadcrumbItem
                key='home-page'
                path={{
                  name: 'Home',
                  icon: FaHouse,
                }}
              />
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          {segments.map((path, idx) => {
            const isCurrentPage = idx === segments.length - 1;
            // [chakra-todo] - consider refactor.
            return (
              <Breadcrumb.Item key={path.name + idx}>
                {isCurrentPage ? (
                  <Breadcrumb.CurrentLink>
                    <BreadcrumbItem isCurrentPage={isCurrentPage} path={path} />
                  </Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link href={path.route}>
                    <BreadcrumbItem isCurrentPage={isCurrentPage} path={path} />
                  </Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </Flex>
  );
};
