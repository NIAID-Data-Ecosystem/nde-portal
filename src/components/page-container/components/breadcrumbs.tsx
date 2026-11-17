import { Breadcrumb } from '@chakra-ui/react';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';

import { getSafeInternalPath } from '../helpers';
import { BreadcrumbSegment } from '../hooks/useBreadcrumbs';

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
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {/* home */}
        <Breadcrumb.Item key='home-page'>
          <Breadcrumb.Link href='/'>
            <FaHouse />
            Home
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        {safeSegments.map(({ name, route, isCurrentPage }, idx) => {
          return (
            <React.Fragment key={name + idx}>
              <Breadcrumb.Separator />

              <Breadcrumb.Item>
                {isCurrentPage ? (
                  <Breadcrumb.CurrentLink>{name}</Breadcrumb.CurrentLink>
                ) : (
                  <Breadcrumb.Link href={route}>{name}</Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
            </React.Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
};
