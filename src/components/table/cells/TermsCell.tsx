import React from 'react';
import { Link } from 'src/components/link';
import type { DefinedTerm, QuantitativeValue } from 'src/utils/api/types';

import { formatNumericValue, formatTerm, formatUnitText } from '../utils/terms';
import { EmptyValue } from './EmptyValue';
import { ExpandableList } from './Expandable';

/** A value of a term-shaped property (pathogen, species, sample type, …). */
export type TermValue =
  | string
  | number
  | boolean
  | DefinedTerm
  | QuantitativeValue
  | null
  | undefined;

// `@type` first, so a QuantitativeValue with only a `name` (no number) isn't
// taken for a DefinedTerm.
const isQuantitativeValue = (term: object): term is QuantitativeValue =>
  (term as QuantitativeValue)['@type'] === 'QuantitativeValue' ||
  'value' in term ||
  'minValue' in term ||
  'maxValue' in term;

const isDefinedTerm = (term: object): term is DefinedTerm =>
  'name' in term || 'identifier' in term || 'url' in term;

/** "5 - 10 years"; the `name` when there's no number (`"42 year"`). */
const quantityText = ({
  value,
  minValue,
  maxValue,
  name,
  unitText,
}: QuantitativeValue) => {
  const amount = formatNumericValue({ value, minValue, maxValue });
  if (!amount) return name ?? '';
  return unitText ? `${amount} ${formatUnitText(unitText)}` : amount;
};

/**
 * One term as plain text, with its url when it links out: what `renderTerm`
 * shows, for consumers that need the text rather than an element (the Search
 * tables' XLSX export). Strings and term names get a capital first letter;
 * booleans read Yes/No; quantities get their number and unit. `null` when
 * there's nothing to show.
 */
export const toTermEntry = (
  term: TermValue,
): { text: string; url?: string } | null => {
  if (term == null) return null;
  if (typeof term === 'boolean') return { text: term ? 'Yes' : 'No' };
  if (typeof term === 'number') {
    return Number.isFinite(term) ? { text: term.toLocaleString() } : null;
  }
  if (typeof term === 'string') {
    const text = formatTerm(term);
    return text ? { text } : null;
  }
  if (typeof term !== 'object') return null;

  if (isQuantitativeValue(term)) {
    const text = quantityText(term);
    return text ? { text } : null;
  }
  if (isDefinedTerm(term)) {
    const text = formatTerm(term.name || term.identifier || '');
    if (term.url) return { text: text || term.url, url: term.url };
    return text ? { text } : null;
  }
  return null;
};

/**
 * One term as text, or as an external link when it has a url (see
 * `toTermEntry` for the text).
 *
 * A building block: returns `null` when there's nothing to show, so the caller
 * decides what an empty cell shows. Plain elements that inherit the cell's
 * font and colour.
 */
export const renderTerm = (
  term: TermValue,
  key?: React.Key,
): React.ReactElement | null => {
  const entry = toTermEntry(term);
  if (!entry) return null;
  if (entry.url) {
    return (
      <Link key={key} href={entry.url} isExternal>
        {entry.text}
      </Link>
    );
  }
  return <span key={key}>{entry.text}</span>;
};

/**
 * A term-shaped value in a DataTable cell: a single term as is, a list one per
 * line with "Show N More" past `maxVisible` (5). The "No data" placeholder
 * when nothing in it can be shown.
 */
export const TermsCell = ({
  values,
  maxVisible,
  toggleContext,
}: {
  values: TermValue | TermValue[];
  maxVisible?: number;
  /** Read after "Show N More" (e.g. the column header). */
  toggleContext?: string;
}) => {
  const list = Array.isArray(values) ? values : [values];
  const items = list
    .map((term, index) => renderTerm(term, index))
    .filter((item): item is React.ReactElement => item !== null);

  if (items.length === 0) return <EmptyValue />;
  if (!Array.isArray(values)) return items[0];
  return (
    <ExpandableList maxVisible={maxVisible} toggleContext={toggleContext}>
      {items}
    </ExpandableList>
  );
};
