import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Link } from 'src/components/link';

import { EmptyValue } from './EmptyValue';

/**
 * A record's name, linking to its resource page the way the result cards do.
 *
 * The current page travels as `referrerPath` in the router query (not the
 * displayed URL), so the resource page's breadcrumb can link back to it. It's
 * read from the router by default, since a DataTable's columns are module
 * constants and can't be handed per-render props. Plain text when the record
 * has no id, rather than a dead link; the "No data" placeholder with no label.
 */
export const ResourceLinkCell = ({
  id,
  label,
  referrerPath,
}: {
  id?: string | null;
  label?: string | null;
  /** Overrides the current path as the referrer. */
  referrerPath?: string;
}) => {
  const { asPath } = useRouter();
  if (!label) return <EmptyValue />;
  if (!id) return <>{label}</>;
  return (
    <Link asChild>
      <NextLink
        href={{
          pathname: '/resources/',
          query: { id, referrerPath: referrerPath ?? asPath },
        }}
        as={`/resources?id=${id}`}
        prefetch={false}
      >
        {label}
      </NextLink>
    </Link>
  );
};
