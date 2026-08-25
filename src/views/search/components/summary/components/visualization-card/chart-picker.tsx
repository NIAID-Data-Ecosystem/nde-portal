import { Flex, NativeSelect } from '@chakra-ui/react';

import { ChartType } from '../../types';

export const ChartTypePicker = (props: {
  value: ChartType;
  options: ChartType[];
  onChange: (next: ChartType) => void;
  disabled?: boolean;
  /** Name of the chart this picker controls, for an accessible label. */
  label?: string;
}) => {
  return (
    <Flex justifyContent='flex-end'>
      <NativeSelect.Root
        size='xs'
        disabled={props.disabled}
        aria-label={
          props.label ? `Chart type for ${props.label}` : 'Chart type'
        }
      >
        <NativeSelect.Field
          width='unset'
          value={props.value}
          onChange={e => props.onChange(e.target.value as ChartType)}
          style={{ textTransform: 'capitalize' }}
        >
          {props.options.map(o => (
            <option key={o} value={o}>
              {o} chart
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Flex>
  );
};
