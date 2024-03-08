import { Flex } from '@chakra-ui/react';
import { RadioFilter } from './radio-filter';
import { TableData } from '..';
import { getDataTypeName } from '../helpers';
import { useMemo } from 'react';

interface TableFiltersProps {
  data: TableData[];
  updateFilter: (filter: { [key: string]: string[] }) => void;
}
export const Filters = ({ data, updateFilter }: TableFiltersProps) => {
  // For dataType, get all unique values and their counts
  const dataTypes = useMemo(
    () =>
      data.reduce((acc, d) => {
        if (!acc.find(a => a.name === 'All')) {
          acc.push({ name: 'All', value: 'all', count: 0 });
        }
        if (!acc.find(a => a.value === d.dataType)) {
          acc.push({
            name: getDataTypeName(d.dataType),
            value: d.dataType,
            count: 1,
          });
        } else {
          acc.find(a => a.value === d.dataType)!.count++;
        }
        acc.find(a => a.name === 'All')!.count++;
        return acc;
      }, [] as { name: string; value: string; count: number }[]),
    [data],
  );

  return (
    <Flex>
      {/* Data type radio */}
      {dataTypes.length > 0 && (
        <RadioFilter
          defaultValue={dataTypes[0].value}
          options={dataTypes}
          handleChange={value => {
            updateFilter({ dataType: value === 'all' ? [] : [value] });
          }}
        />
      )}
    </Flex>
  );
};
