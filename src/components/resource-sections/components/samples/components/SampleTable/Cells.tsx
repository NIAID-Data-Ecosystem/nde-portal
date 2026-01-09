import { Flex, Text, TextProps } from '@chakra-ui/react';
import { formatTerm, formatUnitText, formatNumericValue } from '../../helpers';
import { Link } from 'src/components/link';
import { DefinedTerm, QuantitativeValue } from 'src/utils/api/types';
import { Column } from 'src/components/table';

const TextCell = ({ children, ...rest }: TextProps) => {
  return (
    <Text fontSize='sm' {...rest}>
      {children}
    </Text>
  );
};

const DefinedTermCell = ({ identifier, name, url }: DefinedTerm) => {
  const label = formatTerm(name || identifier || '');
  if (label || url) {
    return url ? (
      <Link href={url} isExternal>
        {label || url}
      </Link>
    ) : (
      <TextCell>{label}</TextCell>
    );
  }
  return null;
};

const QuantitativeValueCell = ({
  maxValue,
  minValue,
  unitText,
  value,
}: QuantitativeValue) => {
  const valueStr = formatNumericValue({
    value,
    minValue,
    maxValue,
  });

  if (!unitText) return <TextCell>{valueStr}</TextCell>;
  const unitStr = formatUnitText(unitText);
  return <TextCell>{`${valueStr} ${unitStr}`}</TextCell>;
};

/**
 * Render the values cell based on the type of data it contains.
 * Supports strings, QuantitativeValues, DefinedTerms, and arrays of these types.
 */

export type CellValue =
  | string
  | DefinedTerm
  | QuantitativeValue
  | null
  | undefined;

export const renderValue = (val: CellValue, key?: React.Key) => {
  if (val == null) return null;

  if (typeof val === 'string') {
    return <TextCell key={key}>{formatTerm(val)}</TextCell>;
  }

  if ('value' in val || 'minValue' in val || 'maxValue' in val) {
    return <QuantitativeValueCell key={key} {...val} />;
  }

  if ('name' in val || 'identifier' in val || 'url' in val) {
    return <DefinedTermCell key={key} {...val} />;
  }

  return null;
};

// Render cell data which can be a single value or an array of values.
const renderCellData = (props: {
  column: Column;
  data: CellValue | CellValue[];
  isLoading?: boolean;
}) => {
  const cellValue = props.data;

  // Array of values (e.g. strings, DefinedTerms, QuantitativeValues)
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

export const Cell = {
  Text: TextCell,
  DefinedTerm: DefinedTermCell,
  QuantitativeValue: QuantitativeValueCell,
  renderCellData,
};
