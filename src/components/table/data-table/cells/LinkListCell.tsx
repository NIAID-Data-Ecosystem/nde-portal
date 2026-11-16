import React from 'react';

import { EmptyValue } from './EmptyValue';
import { ExpandableList } from './Expandable';
import { LinkCell } from './LinkCell';

/** One entry of a `LinkListCell`: a label, linked when it has a url. */
export interface LinkEntry {
  label?: string | null;
  url?: string | null;
}

/**
 * Several values stacked one per line, each an external link when it has a
 * url (funders, funding IDs, usage info, …), with "Show N More" past
 * `maxVisible` (5). The "No data" placeholder when no entry has a label or url.
 */
export const LinkListCell = ({
  entries,
  maxVisible,
  toggleContext,
}: {
  entries?: LinkEntry[] | null;
  maxVisible?: number;
  /** Read after "Show N More" (e.g. the column header). */
  toggleContext?: string;
}) => {
  const links = (entries ?? []).filter(entry => entry.label || entry.url);
  if (links.length === 0) return <EmptyValue />;
  return (
    <ExpandableList
      gap={1}
      maxVisible={maxVisible}
      toggleContext={toggleContext}
    >
      {links.map((entry, index) => (
        <LinkCell key={index} href={entry.url} label={entry.label} external />
      ))}
    </ExpandableList>
  );
};
