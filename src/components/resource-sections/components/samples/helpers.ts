/**
 * Format unit text:
 * - Lowercase all characters.
 * - Replace underscores (e.g., "CELL_COUNT") with spaces.
 */
export const formatUnitText = (unit: string | undefined) => {
  if (!unit) return '';
  return unit.toLowerCase().replace(/_/g, ' ');
};

/**
 * Format a numeric "value" field.
 * Supports:
 * - Exact number.
 * - Min / Max (range).
 * - Only min (>=)
 * - Only max (<=)
 */
export const formatValue = ({
  value,
  minValue,
  maxValue,
}: {
  value?: number;
  minValue?: number;
  maxValue?: number;
}) => {
  if (value != null) {
    return value.toLocaleString();
  }

  if (minValue != null && maxValue != null) {
    // If min == max, show single number
    if (minValue === maxValue) {
      return minValue.toLocaleString();
    }
    return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
  }

  if (minValue != null) {
    return `>= ${minValue.toLocaleString()}`;
  }

  if (maxValue != null) {
    return `<= ${maxValue.toLocaleString()}`;
  }

  return '';
};

export const formatTerm = (term: string) =>
  term.charAt(0).toUpperCase() + term.slice(1);
