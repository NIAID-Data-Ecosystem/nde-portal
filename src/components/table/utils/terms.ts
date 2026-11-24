/*
Text formatting for schema terms (DefinedTerm, QuantitativeValue) as the tables
show them. The one copy: the resource page's sample helpers re-export these.
*/

/** Capitalizes the first letter, leaving the rest as is ("hello world" → "Hello world"). */
export const formatTerm = (term: string): string => {
  if (!term || typeof term !== 'string') return '';
  return term.charAt(0).toUpperCase() + term.slice(1);
};

/**
 * A unit as text: lowercased, underscores as spaces, plural ("CELL_COUNT" →
 * "cell counts").
 */
export const formatUnitText = (unit: string | undefined): string => {
  if (!unit) return '';
  const text = unit.toLowerCase().replace(/_/g, ' ');
  return text.charAt(text.length - 1) === 's' ? text : `${text}s`;
};

/**
 * A quantity's number: exact (`1,234`), a range (`1 - 10`, or one number when
 * both ends match), or one-sided (`>= 7`, `<= 9`). Blank when there's none.
 */
export const formatNumericValue = ({
  value,
  minValue,
  maxValue,
}: {
  value?: number;
  minValue?: number;
  maxValue?: number;
}): string => {
  if (value != null) return value.toLocaleString();
  if (minValue != null && maxValue != null) {
    if (minValue === maxValue) return minValue.toLocaleString();
    return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
  }
  if (minValue != null) return `>= ${minValue.toLocaleString()}`;
  if (maxValue != null) return `<= ${maxValue.toLocaleString()}`;
  return '';
};
