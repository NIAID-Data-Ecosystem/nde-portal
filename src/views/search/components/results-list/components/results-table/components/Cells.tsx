import { Flex, Text, TextProps } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { DefinedTerm, QuantitativeValue } from 'src/utils/api/types';
import { Column } from 'src/components/table';

const formatTerm = (term: string): string => {
  if (!term || typeof term !== 'string') return '';
  return term.charAt(0).toUpperCase() + term.slice(1);
};

const formatUnitText = (unit: string | undefined): string => {
  if (!unit) return '';
  const s = unit.toLowerCase().replace(/_/g, ' ');
  return s.charAt(s.length - 1) === 's' ? s : `${s}s`;
};

const formatNumericValue = ({
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

const QuantitativeValueCell = ({
  maxValue,
  minValue,
  name,
  unitText,
  value,
}: QuantitativeValue) => {
  const valueStr = formatNumericValue({ value, minValue, maxValue });
  if (!valueStr && name) return <TextCell>{name}</TextCell>;
  if (!unitText) return <TextCell>{valueStr}</TextCell>;
  return <TextCell>{`${valueStr} ${formatUnitText(unitText)}`}</TextCell>;
};

export type CellValue =
  | string
  | DefinedTerm
  | QuantitativeValue
  | null
  | undefined;

// Render a single scalar value to the appropriate cell element.
export const renderValue = (val: CellValue, key?: React.Key) => {
  if (val == null) return null;

  if (typeof val === 'string') {
    return <TextCell key={key}>{formatTerm(val)}</TextCell>;
  }

  if (typeof val === 'boolean') {
    return <TextCell key={key}>{val ? 'Yes' : 'No'}</TextCell>;
  }

  if (
    typeof val === 'object' &&
    ((val as QuantitativeValue)['@type'] === 'QuantitativeValue' ||
      'value' in val ||
      'minValue' in val ||
      'maxValue' in val)
  ) {
    return <QuantitativeValueCell key={key} {...(val as QuantitativeValue)} />;
  }

  if (
    typeof val === 'object' &&
    ('name' in val || 'identifier' in val || 'url' in val)
  ) {
    return <DefinedTermCell key={key} {...(val as DefinedTerm)} />;
  }

  return null;
};

// Render a cell value that may be a single scalar or an array of scalars.
export const renderCellData = (props: {
  column: Column;
  data: CellValue | CellValue[];
  isLoading?: boolean;
}): React.ReactNode => {
  const cellValue = props.data;

  if (Array.isArray(cellValue)) {
    if (cellValue.length === 0) return null;
    return (
      <Flex flexDirection='column' gap={2}>
        {cellValue.map((value, idx) => renderValue(value, idx))}
      </Flex>
    );
  }

  return renderValue(cellValue);
};
