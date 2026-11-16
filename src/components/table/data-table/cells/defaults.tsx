import { FormatNumber } from '@chakra-ui/react';
import React from 'react';
import { formatDate } from 'src/utils/api/helpers';

import type { ColumnType, ResolvedColumn } from '../types';
import { toText } from '../utils/values';
import { ExpandableList, ExpandableText } from './Expandable';
import { LinkCell } from './LinkCell';
import { TagsCell } from './TagsCell';

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

const linkParts = (value: unknown) => {
  if (typeof value === 'string') return { href: value, label: value };
  const record = (value ?? {}) as Record<string, unknown>;
  const href = (record.href ?? record.url) as string | undefined;
  return { href, label: toText(record.label ?? record.name) || href };
};

type DefaultRenderer = (props: {
  value: unknown;
  column: ResolvedColumn<any>;
}) => React.ReactNode;

/** What a column renders when it has no custom `cell`. */
export const DEFAULT_RENDERERS: Record<ColumnType, DefaultRenderer> = {
  text: ({ value }) => toText(value),
  identifier: ({ value }) => toText(value),
  longText: ({ value, column }) => (
    <ExpandableText
      text={toText(value)}
      noOfLines={4}
      toggleContext={column.header}
    />
  ),
  number: ({ value }) => {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? (
      <FormatNumber value={number} />
    ) : (
      toText(value)
    );
  },
  date: ({ value }) =>
    formatDate(typeof value === 'string' ? value : null) ?? toText(value),
  link: ({ value }) => <LinkCell {...linkParts(value)} />,
  list: ({ value, column }) => (
    <ExpandableList gap={1} toggleContext={column.header}>
      {toArray(value).map((item, i) =>
        typeof item === 'object' &&
        item &&
        ('url' in item || 'href' in item) ? (
          <LinkCell key={i} {...linkParts(item)} />
        ) : (
          <span key={i}>{toText(item)}</span>
        ),
      )}
    </ExpandableList>
  ),
  tags: ({ value, column }) => (
    <TagsCell
      values={toArray(value).map(toText)}
      toggleContext={column.header}
    />
  ),
};
