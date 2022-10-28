import React, { useEffect, useState } from 'react';
import { Box, ButtonProps, Button, Flex, Input, Text } from 'nde-design-system';

interface DatePickerProps {
  colorScheme: ButtonProps['colorScheme'];
  min: string;
  max: string;
  selectedDates: string[];
  handleSelectedFilter: (arg: string[]) => void;
  resetFilter: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  colorScheme,
  min,
  max,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
}) => {
  const [selected, setSelected] = useState(selectedDates);

  useEffect(() => {
    setSelected(selectedDates);
  }, [selectedDates]);

  return (
    <Flex
      id='date-picker'
      as='form'
      w='100%'
      flexDirection='column'
      onSubmit={e => {
        e.preventDefault();
        const dates = selected;
        // automatically set start date to min if none is provided
        if (!dates[0]) {
          dates[0] = min;
        }
        // automatically set start date to max if none is provided
        if (!dates[1]) {
          dates[1] = max;
        }
        handleSelectedFilter(dates);
      }}
    >
      <Flex flexWrap='wrap'>
        <Box maxW='200px' mr={1}>
          <Text fontSize='xs'>
            <label htmlFor='start'>Start date:</label>
          </Text>

          <Input
            id='start'
            type='date'
            colorScheme={colorScheme}
            bg='white'
            min={min}
            max={max}
            value={selected[0] === '-_exists_' ? '' : selected[0] || min}
            onChange={e => {
              // If not max selected, set the max value to the max date in data.
              let newSelection = [e.target.value, selected[1] || max];
              setSelected(newSelection);
            }}
          />
        </Box>
        <Box maxW='200px'>
          <Text fontSize='xs'>
            <label htmlFor='end'>End date:</label>
          </Text>
          <Input
            id='end'
            type='date'
            colorScheme={colorScheme}
            bg='white'
            min={min}
            max={max}
            value={selected[0] === '-_exists_' ? '' : selected[1] || max}
            onChange={e => {
              // If not max selected, set the max value to the max date in data.
              let newSelection = [selected[0] || min, e.target.value];
              setSelected(newSelection);
            }}
          />
        </Box>
      </Flex>
      <Flex alignItems='center' mt={2}>
        <Button
          size='sm'
          variant='solid'
          type='submit'
          colorScheme={colorScheme}
          mr={1}
        >
          Submit
        </Button>
        <Button
          size='sm'
          variant='outline'
          colorScheme={colorScheme}
          onClick={() => resetFilter()}
          isDisabled={!selectedDates.length}
          mx={1}
        >
          Reset
        </Button>
      </Flex>
    </Flex>
  );
};
