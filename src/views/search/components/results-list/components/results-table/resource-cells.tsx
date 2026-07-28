import React from 'react';
import NextLink from 'next/link';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import { Author, FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import {
  CatalogCell,
  FunderCell,
  FundingIdCell,
  renderCellData,
} from './components/Cells';
import { ExpandableList, ExpandableText } from './components/ExpandableCells';
import { CatalogEntry, FunderEntry, FundingIdEntry } from './types';
import { toCatalogEntries, toFunderEntries, toFundingIdEntries } from './utils';

/**
 * Row + cell logic shared by the Dataset and ComputationalTool table views.
 *
 * Both tables describe the same underlying resource shape and differ only in
 * which type-specific properties they expose as columns, so the common
 * columns (name, description, date, source, funding, author, license) are
 * rendered here once and the type-specific ones fall through to the shared
 * `renderCellData`.
 */

/**
 * Flatten a resource into a row: the record itself plus the normalized
 * source / funding lists the cells below expect.
 */
export const toResourceRow = (
  resource: FormattedResource,
): Record<string, unknown> => {
  const catalogEntries = toCatalogEntries(resource);
  const funderEntries = toFunderEntries(resource);
  const fundingIdEntries = toFundingIdEntries(resource);

  return {
    ...resource,
    // Always store arrays (or null when empty) so the cells can stack multiple
    // entries per record uniformly.
    includedInDataCatalog: catalogEntries.length > 0 ? catalogEntries : null,
    funder: funderEntries.length > 0 ? funderEntries : null,
    fundingId: fundingIdEntries.length > 0 ? fundingIdEntries : null,
  };
};

/** Best available display name for an author entry. */
const getAuthorName = (author: Author): string => {
  if (author?.name) return author.name;
  const parts = [author?.givenName, author?.familyName].filter(Boolean);
  return parts.join(' ');
};

/**
 * Build the internal record link. `referrerPath` is carried through so the
 * resource page can render the correct breadcrumbs, matching the card view.
 */
const getRecordHref = (id: string, referrerPath?: string): string => {
  const query = new URLSearchParams({ id });
  if (referrerPath) {
    query.set('referrerPath', referrerPath);
  }
  return `/resources?${query.toString()}`;
};

/**
 * Create the `getCells` renderer for a resource table.
 *
 * @param referrerPath  Current path, forwarded to the record page for breadcrumbs.
 */
export const createResourceGetCells =
  (referrerPath?: string) =>
  ({
    column,
    data,
    isLoading,
  }: {
    column: Column;
    data: Record<string, unknown>;
    isLoading?: boolean;
  }): React.ReactNode => {
    const value = data?.[column.property];

    // Name: links to the record page (same target as the card view).
    if (column.property === 'name') {
      const id = data?._id as string | undefined;
      const label = (value as string) || '';
      if (!label && !id) return null;
      return id ? (
        <Link
          as={NextLink}
          href={getRecordHref(id, referrerPath)}
          prefetch={false}
          fontSize='sm'
        >
          {label || id}
        </Link>
      ) : (
        <Text fontSize='sm'>{label}</Text>
      );
    }

    // Description: clamped to a few lines with a "Show more" / "Show less" toggle.
    if (column.property === 'description') {
      return (
        <ExpandableText
          text={(value as string) || ''}
          noOfLines={4}
          isLoading={isLoading}
        />
      );
    }

    // Source: Array<{ name, url }> => one link/text per catalog entry.
    if (column.property === 'includedInDataCatalog') {
      return <CatalogCell entries={value as CatalogEntry[] | null} />;
    }

    // Funder: Array<{ name, identifier }> => name linked to funder identifier.
    if (column.property === 'funder') {
      return <FunderCell entries={value as FunderEntry[] | null} />;
    }

    // Funding ID: Array<{ identifier, url }> => identifier linked to funding url.
    if (column.property === 'fundingId') {
      return <FundingIdCell entries={value as FundingIdEntry[] | null} />;
    }

    // Author: name (or given + family name), linked to the author URL when present.
    if (column.property === 'author') {
      const authors = (
        Array.isArray(value) ? value : value ? [value] : []
      ) as Author[];
      const named = authors
        .map(author => ({ name: getAuthorName(author), url: author?.url }))
        .filter(entry => entry.name);
      if (named.length === 0) return null;
      return (
        <ExpandableList gap={1}>
          {named.map((author, idx) =>
            author.url ? (
              <Link key={idx} href={author.url} isExternal fontSize='sm'>
                {author.name}
              </Link>
            ) : (
              <Text key={idx} fontSize='sm'>
                {author.name}
              </Text>
            ),
          )}
        </ExpandableList>
      );
    }

    // License: formatted title, linked when the license value is a URL.
    if (column.property === 'license') {
      if (typeof value !== 'string' || !value) return null;
      const { title, url } = formatLicense(value);
      return url ? (
        <Link href={url} isExternal fontSize='sm'>
          {title || url}
        </Link>
      ) : (
        <Text fontSize='sm'>{title}</Text>
      );
    }

    // Scalar string fields that don't need DefinedTerm / QuantitativeValue rendering
    if (
      column.property === 'date' ||
      column.property === 'conditionsOfAccess'
    ) {
      return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
    }

    // All other fields: delegate to the shared cell renderer
    return renderCellData({ column, data: value as any, isLoading });
  };
