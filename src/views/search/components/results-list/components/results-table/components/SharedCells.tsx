import React from 'react';
import {
  LinkCell,
  LinkListCell as SharedLinkListCell,
  ResourceLinkCell,
} from 'src/components/table/data-table/cells';

/*
Legacy `ResultsTable` adapters over the shared cells
(src/components/table/data-table/cells), for the Search tables not yet on
DataTable. Deleted once they migrate. Unlike the shared cells they return
`null` for nothing to show, so those tables stay blank there.
*/

export type LinkEntry = { label: string; url: string | null };

/** A record's name, linking to its resource page (see `ResourceLinkCell`). */
export const ResourceNameCell = ({
  label,
  id,
  referrerPath,
}: {
  label: string;
  id?: string;
  referrerPath?: string;
}) =>
  label ? (
    <ResourceLinkCell label={label} id={id} referrerPath={referrerPath} />
  ) : null;

/** A single value rendered as an external link when it has a url. */
export const LinkOrTextCell = ({ label, url }: LinkEntry) =>
  label || url ? <LinkCell href={url} label={label} external /> : null;

/** Several values stacked one per line, each an external link when it has a url. */
export const LinkListCell = ({
  entries,
  toggleContext,
}: {
  entries?: LinkEntry[] | null;
  /** Read after "Show N More" (e.g. the column header). */
  toggleContext?: string;
}) =>
  entries?.some(entry => entry.label || entry.url) ? (
    <SharedLinkListCell entries={entries} toggleContext={toggleContext} />
  ) : null;
