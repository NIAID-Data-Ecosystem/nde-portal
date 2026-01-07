import { Flex, Text, TextProps } from '@chakra-ui/react';
import { formatTerm, formatUnitText, formatValue } from '../../helpers';
import { Link } from 'src/components/link';
import { DefinedTerm, QuantitativeValue } from 'src/utils/api/types';
import { Column } from 'src/components/table';
import { SamplePropertyRow } from './config';

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
      <Link href={url}>{label || url}</Link>
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
  const valueStr = formatValue({
    value,
    minValue,
    maxValue,
  });

  if (!unitText) return <TextCell>{valueStr}</TextCell>;
  const unitStr = formatUnitText(unitText);
  return <TextCell>{`${valueStr} ${unitStr}`}</TextCell>;
};

const renderLabelCell = ({
  data,
}: {
  column: Column;
  data: SamplePropertyRow;
  isLoading?: boolean;
}) => {
  return <TextCell>{data.label}</TextCell>;
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

const renderValuesCellRefactor = (props: {
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

const renderValuesCell = (props: {
  column: Column;
  data: SamplePropertyRow;
  isLoading?: boolean;
}) => {
  const cellValue = props.data.values;

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
  renderLabel: renderLabelCell,
  renderValues: renderValuesCell,
  renderValuesCellRefactor,
};
