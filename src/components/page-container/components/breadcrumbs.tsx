import { FaHouse } from 'react-icons/fa6';
import { Breadcrumb, Flex } from '@chakra-ui/react';
import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';
import React from 'react';

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ segments }) => {
  if (!segments.length) return null;

  return (
    <Flex px={6} py={2}>
      <Breadcrumb.Root colorPalette='niaid' width='100%'>
        <Breadcrumb.List width='100%'>
          {/* home */}
          <Breadcrumb.Item key='home-page' overflow='visible'>
            <Breadcrumb.Link href='/'>
              <FaHouse />
              Home
            </Breadcrumb.Link>
          </Breadcrumb.Item>

          {/* list of paths */}
          {segments.map((path, idx) => {
            const isCurrentPage = idx === segments.length - 1;
            return (
              <React.Fragment key={path.name + idx}>
                <Breadcrumb.Separator />
                <Breadcrumb.Item truncate>
                  {isCurrentPage ? (
                    <Breadcrumb.CurrentLink>{path.name}</Breadcrumb.CurrentLink>
                  ) : (
                    <Breadcrumb.Link href={path.route}>
                      {path.name}
                    </Breadcrumb.Link>
                  )}
                </Breadcrumb.Item>
              </React.Fragment>
            );
          })}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </Flex>
  );
};
