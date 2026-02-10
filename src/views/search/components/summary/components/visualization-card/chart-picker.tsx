import { Flex, Select } from '@chakra-ui/react';
import { ChartType } from '../../types';

export const ChartTypePicker = (props: {
  value: ChartType;
  options: ChartType[];
  onChange: (next: ChartType) => void;
  isDisabled?: boolean;
}) => {
  return (
    <Flex justifyContent='flex-end'>
      <Select
        width='unset'
        size='xs'
        value={props.value}
        disabled={props.isDisabled}
        onChange={e => props.onChange(e.target.value as ChartType)}
        style={{ textTransform: 'capitalize' }}
      >
        {props.options.map(o => (
          <option key={o} value={o}>
            {o} chart
          </option>
        ))}
      </Select>
    </Flex>
  );
};
