import { FormatNumber } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useId, useState } from 'react';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';
import {
  ExpandableList,
  ExpandableText,
} from 'src/components/expandable-cells';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { formatDate } from 'src/utils/api/helpers';

import type { ColumnType, ResolvedColumn } from '../types';
import { toText } from '../utils/values';

/*
Plain elements with inline styles rather than Chakra components: a populated
table renders hundreds of these (and thousands of tags), and a styled component
per instance was most of the native table's mount cost. Inline style objects
are shared constants, so they work anywhere and cost one attribute each.
*/
const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};
const muted: React.CSSProperties = { color: 'var(--chakra-colors-fg-muted)' };

/**
 * The placeholder for a genuinely missing value. The dash is decorative, so a
 * screen reader hears "No data" once rather than "dash, No data".
 */
export const EmptyValue = () => (
  <>
    <span aria-hidden='true' style={muted}>
      —
    </span>
    <span style={visuallyHidden}>No data</span>
  </>
);

const isExternalHref = (href: string) => /^(https?:)?\/\/|^www\./i.test(href);

/**
 * A link cell. Internal paths use Next's client-side navigation; anything
 * absolute opens in a new tab with the external-link icon. Falls back to the
 * URL as the label, and to plain text when there is no URL.
 */
export const LinkCell = ({
  href,
  label,
  external,
}: {
  href?: string | null;
  label?: string | null;
  /** Overrides the internal/external guess made from `href`. */
  external?: boolean;
}) => {
  const text = label || href || '';
  if (!href) return text ? <>{text}</> : <EmptyValue />;
  if (external ?? isExternalHref(href)) {
    const url = /^www\./i.test(href) ? `https://${href}` : href;
    return (
      <Link href={url} isExternal>
        {text}
      </Link>
    );
  }
  return (
    <Link asChild>
      <NextLink href={href} prefetch={false}>
        {text}
      </NextLink>
    </Link>
  );
};

/*
Scrolling slides tags under a stationary cursor, which fires `pointerover` on
each one; tooltips shouldn't mount or pop open mid-scroll. (Pointer movement
can't tell them apart: `movementX/Y` are always 0 on `pointerover`.) So a hover
only counts once scrolling has settled. One passive listener for the page,
added on first use.
*/
let lastScrollAt = -Infinity;
let watchingScroll = false;
const scrolledRecently = () => {
  if (!watchingScroll && typeof window !== 'undefined') {
    watchingScroll = true;
    window.addEventListener(
      'scroll',
      () => {
        lastScrollAt = performance.now();
      },
      { capture: true, passive: true },
    );
  }
  return performance.now() - lastScrollAt < 150;
};

const isClipped = (el: Element) =>
  el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;

/**
 * Short terms as tags, with "Show N More" past `maxVisible`.
 *
 * Each tag is a single plain span styled by the table (`.nde-tag` in the
 * dataTable recipe), with the look of the repo's subtle, small, full-radius
 * `Tag`, clamped to one line. When one is actually clipped, hovering it shows
 * the full text in a tooltip. The tooltip is mounted for that one tag on first
 * hover, from a single handler on the list, instead of a tooltip machine (and
 * a layout read to decide whether it's needed) per tag up front.
 */
export const TagsCell = ({
  values,
  maxVisible = 12,
  toggleContext,
}: {
  values: string[];
  maxVisible?: number;
  toggleContext?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const listId = useId();

  const labels = values.filter(Boolean);
  if (labels.length === 0) return <EmptyValue />;

  const hiddenCount = Math.max(0, labels.length - maxVisible);
  const visible = expanded ? labels : labels.slice(0, maxVisible);

  return (
    <span
      id={listId}
      className='nde-tags'
      // `over` rather than `move`: once per tag entered, not per pixel, so
      // scrolling doesn't send a stream of events through React.
      onPointerOver={event => {
        if (scrolledRecently()) return;
        const tag = (event.target as Element).closest?.('.nde-tag');
        const index = Number(tag?.getAttribute('data-index'));
        if (!tag || index === tooltipIndex || !isClipped(tag)) {
          return;
        }
        setTooltipIndex(index);
      }}
    >
      {visible.map((label, index) => {
        const tag = (
          <span key={index} className='nde-tag' data-index={index}>
            {label}
          </span>
        );
        return index === tooltipIndex ? (
          <Tooltip key={index} content={label} defaultOpen>
            {tag}
          </Tooltip>
        ) : (
          tag
        );
      })}
      {hiddenCount > 0 && (
        <CollapsibleTextTrigger
          isOpen={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show Less' : `Show ${hiddenCount} More`}
          {toggleContext && (
            <span style={visuallyHidden}> {toggleContext}</span>
          )}
        </CollapsibleTextTrigger>
      )}
    </span>
  );
};

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
