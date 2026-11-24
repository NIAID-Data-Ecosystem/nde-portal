import { Text, TextProps } from '@chakra-ui/react';
import { XlsxCellEntry } from 'src/components/download-metadata/xlsx';
import { ExpandableList } from 'src/components/expandable-cells';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import { DefinedTerm, QuantitativeValue } from 'src/utils/api/types';

export const formatTerm = (term: string): string => {
  if (!term || typeof term !== 'string') return '';
  return term.charAt(0).toUpperCase() + term.slice(1);
};

export const formatUnitText = (unit: string | undefined): string => {
  if (!unit) return '';
  const s = unit.toLowerCase().replace(/_/g, ' ');
  return s.charAt(s.length - 1) === 's' ? s : `${s}s`;
};

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

const TextCell = ({ children, ...rest }: TextProps) => (
  <Text fontSize='sm' {...rest}>
    {children}
  </Text>
);

const DefinedTermCell = ({ identifier, name, url }: DefinedTerm) => {
  const label = formatTerm(name || identifier || '');
  if (!label && !url) return null;
  return url ? (
    <Link href={url} isExternal>
      {label || url}
    </Link>
  ) : (
    <TextCell>{label}</TextCell>
  );
};

// The text a QuantitativeValue cell displays, e.g. "10 - 20 samples".
export const formatQuantitativeValue = ({
  maxValue,
  minValue,
  name,
  unitText,
  value,
}: QuantitativeValue): string => {
  const valueStr = formatNumericValue({ value, minValue, maxValue });
  if (!valueStr && name) return name;
  if (!unitText) return valueStr;
  return `${valueStr} ${formatUnitText(unitText)}`;
};

const QuantitativeValueCell = (props: QuantitativeValue) => (
  <TextCell>{formatQuantitativeValue(props)}</TextCell>
);

export type CellValue =
  | string
  | DefinedTerm
  | QuantitativeValue
  | null
  | undefined;

const isQuantitativeValue = (val: object) =>
  (val as QuantitativeValue)['@type'] === 'QuantitativeValue' ||
  'value' in val ||
  'minValue' in val ||
  'maxValue' in val;

const isDefinedTerm = (val: object) =>
  'name' in val || 'identifier' in val || 'url' in val;

// Render a single scalar value to the appropriate cell element.
export const renderValue = (val: CellValue, key?: React.Key) => {
  if (val == null) return null;

  if (typeof val === 'string') {
    return <TextCell key={key}>{formatTerm(val)}</TextCell>;
  }

  if (typeof val === 'boolean') {
    return <TextCell key={key}>{val ? 'Yes' : 'No'}</TextCell>;
  }

  if (typeof val === 'object' && isQuantitativeValue(val)) {
    return <QuantitativeValueCell key={key} {...(val as QuantitativeValue)} />;
  }

  if (typeof val === 'object' && isDefinedTerm(val)) {
    return <DefinedTermCell key={key} {...(val as DefinedTerm)} />;
  }

  return null;
};

// Render a cell value that may be a single scalar or an array of scalars.
export const renderCellData = (props: {
  column: Column;
  data: CellValue | CellValue[];
  loading?: boolean;
}): React.ReactNode => {
  const cellValue = props.data;

  if (Array.isArray(cellValue)) {
    if (cellValue.length === 0) return null;
    return (
      <ExpandableList>
        {cellValue.map((value, idx) => renderValue(value, idx))}
      </ExpandableList>
    );
  }

  return renderValue(cellValue);
};

/**
 * Plain-data counterpart of `renderCellData`, used by the XLSX export: the
 * text (and link) each rendered value shows, one entry per value.
 */
export const valueToEntries = (
  cellValue: CellValue | CellValue[] | boolean,
): XlsxCellEntry[] => {
  if (Array.isArray(cellValue)) return cellValue.flatMap(valueToEntries);
  if (cellValue == null) return [];

  if (typeof cellValue === 'string') return [{ text: formatTerm(cellValue) }];
  if (typeof cellValue === 'boolean') {
    return [{ text: cellValue ? 'Yes' : 'No' }];
  }
  if (typeof cellValue === 'number') return [{ text: String(cellValue) }];

  if (typeof cellValue === 'object' && isQuantitativeValue(cellValue)) {
    const text = formatQuantitativeValue(cellValue as QuantitativeValue);
    return text ? [{ text }] : [];
  }

  if (typeof cellValue === 'object' && isDefinedTerm(cellValue)) {
    const { identifier, name, url } = cellValue as DefinedTerm;
    const text = formatTerm(name || identifier || '');
    return text || url ? [{ text: text || url || '', url }] : [];
  }

  return [];
};
