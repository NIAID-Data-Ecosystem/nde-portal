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
 * One term as text, or as an external link when it has a url. Strings and term
 * names get a capital first letter; booleans read Yes/No; quantities get
 * their number and unit.
 *
 * A building block: returns `null` when there's nothing to show, so the caller
 * decides what an empty cell shows. Plain elements that inherit the cell's
 * font and colour, so it renders the same in DataTable and the legacy tables.
 */
export const renderTerm = (
  term: TermValue,
  key?: React.Key,
): React.ReactElement | null => {
  if (term == null) return null;
  if (typeof term === 'boolean') {
    return <span key={key}>{term ? 'Yes' : 'No'}</span>;
  }
  if (typeof term === 'number') {
    return Number.isFinite(term) ? (
      <span key={key}>{term.toLocaleString()}</span>
    ) : null;
  }
  if (typeof term === 'string') {
    const label = formatTerm(term);
    return label ? <span key={key}>{label}</span> : null;
  }
  if (typeof term !== 'object') return null;

  if (isQuantitativeValue(term)) {
    const text = quantityText(term);
    return text ? <span key={key}>{text}</span> : null;
  }
  if (isDefinedTerm(term)) {
    const label = formatTerm(term.name || term.identifier || '');
    if (term.url) {
      return (
        <Link key={key} href={term.url} isExternal>
          {label || term.url}
        </Link>
      );
    }
    return label ? <span key={key}>{label}</span> : null;
  }
  return null;
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
