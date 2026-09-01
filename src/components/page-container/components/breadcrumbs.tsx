import { Breadcrumb } from '@chakra-ui/react';
import { FaHouse } from 'react-icons/fa6';

import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ segments }) => {
  if (!segments.length) return null;

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {/* home */}
        <Breadcrumb.Item key='home-page'>
          <Breadcrumb.Link href='/'>
            <FaHouse />
            Home
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        {segments.map(({ name, route, isCurrentPage }, idx) => {
          return (
            <>
              <Breadcrumb.Separator />

              <Breadcrumb.Item key={name + idx}>
                {isCurrentPage ? (
                  <Breadcrumb.CurrentLink>{name}</Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link href={route}>{name}</Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
            </>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
};
