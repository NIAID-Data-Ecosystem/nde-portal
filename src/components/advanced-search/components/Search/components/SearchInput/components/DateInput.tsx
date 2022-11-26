import { useState } from 'react';
import {
  Box,
  ButtonProps,
  Flex,
  Input,
  InputProps,
  Text,
} from 'nde-design-system';

interface DateInputProps {
  isDisabled?: boolean;
  size: InputProps['size'];
  handleSubmit: (args: { term: string; querystring: string }) => void;
  renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
}

export const DateInputGroup: React.FC<DateInputProps> = ({
  size,
  handleSubmit,
  renderSubmitButton,
  ...props
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <Flex
      as='form'
      onSubmit={e => {
        e.preventDefault();
        const startQuery = !startDate ? '*' : startDate;
        const endQuery = !endDate ? '*' : endDate;

        let term = '';
        if (!startDate && !endDate) {
          term = 'Any Dates';
        } else if (startDate && endDate) {
          term = `Between ${startDate} and ${endDate}`;
        } else if (!startDate) {
          term = `Before ${endDate}`;
        } else if (!endDate) {
          term = `After ${startDate}`;
        }

        handleSubmit({
          term,
          querystring: `[${startQuery} TO ${endQuery}]`,
        });
      }}
      flex={1}
      px={2}
    >
      <Box flex={1} mr={2}>
        <Text fontWeight='medium' color='gray.600'>
          <label htmlFor='date-start'>From:</label>
        </Text>
        <Input
          id='date-start'
          type='date'
          size={size}
          min={undefined}
          max={endDate || undefined} // set the max start date to the end date in the current selection to prevent setting a start date later than the end date.
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value);
          }}
          {...props}
        ></Input>
      </Box>

      <Box flex={1} mr={2}>
        <Text fontWeight='medium' color='gray.600'>
          <label htmlFor='date-end'>To:</label>
        </Text>
        <Input
          id='date-end'
          type='date'
          size={size}
          min={startDate} // set the minimum end date to the start date in the current selection to prevent setting an end date earlier than the start date.
          max={undefined}
          value={endDate}
          onChange={e => {
            setEndDate(e.target.value);
          }}
          {...props}
        ></Input>
      </Box>

      <Flex mt={8} alignItems='center'>
        {renderSubmitButton &&
          renderSubmitButton({
            type: 'submit',
            w: '100%',
          })}
      </Flex>
    </Flex>
  );
};
