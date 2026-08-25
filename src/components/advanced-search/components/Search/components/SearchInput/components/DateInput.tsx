import { Box, Flex, Input, Text } from '@chakra-ui/react';

import { getDateQuerystring } from '../helpers';
import { AdvancedSearchInputProps } from '../types';

interface DateInputProps extends AdvancedSearchInputProps {}

export const DateInputGroup: React.FC<DateInputProps> = ({
  size,
  handleChange,
  handleSubmit,
  renderSubmitButton,
  inputValue,
  ...props
}) => {
  const dateInputValue = inputValue as { startDate: string; endDate: string };
  const { startDate, endDate } = dateInputValue;

  return (
    <Flex flex={1} px={2} asChild>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit(getDateQuerystring({ startDate, endDate }));
        }}
      >
        <Box flex={1} mr={2}>
          <Text fontWeight='medium' color='page.placeholder'>
            <label htmlFor='date-start'>From:</label>
          </Text>
          <Input
            id='date-start'
            type='date'
            size={size}
            min={undefined}
            max={endDate || undefined} // set the max start date to the end date in the current selection to prevent setting a start date later than the end date.
            value={startDate || ''}
            onChange={e => {
              const value = getDateQuerystring({ startDate, endDate });

              handleChange({
                ...value,
                value: { ...dateInputValue, startDate: e.target.value },
              });
            }}
            disabled={props.disabled}
          />
        </Box>
        <Box flex={1} mr={2}>
          <Text fontWeight='medium' color='page.placeholder'>
            <label htmlFor='date-end'>To:</label>
          </Text>
          <Input
            id='date-end'
            type='date'
            size={size}
            min={startDate} // set the minimum end date to the start date in the current selection to prevent setting an end date earlier than the start date.
            max={undefined}
            value={endDate || ''}
            onChange={e => {
              const value = getDateQuerystring({ startDate, endDate });

              handleChange({
                ...value,
                value: { ...dateInputValue, endDate: e.target.value },
              });
            }}
            disabled={props.disabled}
          />
        </Box>
        <Flex mt={8} alignItems='center'>
          {renderSubmitButton &&
            renderSubmitButton({
              type: 'submit',
              w: '100%',
              disabled: false,
            })}
        </Flex>
      </form>
    </Flex>
  );
};
