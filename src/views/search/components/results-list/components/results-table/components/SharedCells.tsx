import React from 'react';
import NextLink from 'next/link';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { ExpandableList } from './ExpandableCells';

/**
 * Cell renderers shared by the search-result tables, alongside the value-shaped
 * renderers in `Cells.tsx`. These cover the patterns that recur across table
 * types (an internal resource link, a single external link, a stacked list of
 * links) so each table's `getCells` only describes what is specific to it.
 */

export type LinkEntry = { label: string; url: string | null };

/**
 * A record's name, linking to its resource page the way the result cards do.
 *
 * `referrerPath` is the current path of the search page; it travels in the
 * router query (not the displayed URL) so the resources page breadcrumb can
 * link back to the search the user came from. Falls back to plain text when the
 * record has no id, rather than emitting a dead link.
 */
export const ResourceNameCell = ({
  label,
  id,
  referrerPath,
}: {
  label: string;
  id?: string;
  referrerPath?: string;
}) => {
  if (!label) return null;

  return id ? (
    <NextLink
      href={{ pathname: '/resources/', query: { id, referrerPath } }}
      as={`/resources?id=${id}`}
      passHref
      prefetch={false}
    >
      <Link as='div' fontSize='sm'>
        {label}
      </Link>
    </NextLink>
  ) : (
    <Text fontSize='sm'>{label}</Text>
  );
};

/** A single value rendered as an external link when it has a url. */
export const LinkOrTextCell = ({ label, url }: LinkEntry) => {
  if (!label && !url) return null;
  return url ? (
    <Link href={url} isExternal fontSize='sm'>
      {label || url}
    </Link>
  ) : (
    <Text fontSize='sm'>{label}</Text>
  );
};

/** Several values stacked one per line, each an external link when it has a url. */
export const LinkListCell = ({ entries }: { entries?: LinkEntry[] | null }) => {
  if (!entries || entries.length === 0) return null;
  return (
    <ExpandableList gap={1}>
      {entries.map((entry, idx) => (
        <LinkOrTextCell key={idx} label={entry.label} url={entry.url} />
      ))}
    </ExpandableList>
  );
};
