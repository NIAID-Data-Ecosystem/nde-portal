import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { useDateRangeContext } from '../hooks/useDateRangeContext';
import { formatISOString } from 'src/utils/api/helpers';

interface DatePickerProps {
  colorScheme: string;
  selectedDates: string[];
  handleSelectedFilter: (arg: string[]) => void;
  resetFilter: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  colorScheme,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
}) => {
  const [selected, setSelected] = useState(selectedDates);
  const { allData } = useDateRangeContext();

  // Min is the first date in the complete dataset
  const min = formatISOString((allData && allData[0]?.term) || '');

  // Max is the last date in the complete dataset
  // Cap at current year with 12-31 as the end date
  const maxFromData = formatISOString(
    (allData && allData[allData.length - 1]?.term) || '',
  );
  const currentYear = new Date().getFullYear();
  const maxYear = maxFromData
    ? parseInt(maxFromData.split('-')[0])
    : currentYear;
  const cappedYear = Math.min(maxYear, currentYear);
  const max = `${cappedYear}-12-31`;

  const isDisabled = !allData || !allData.length;

  useEffect(() => {
    setSelected(selectedDates);
  }, [selectedDates]);

  return (
    <Flex
      id='date-picker'
      as='form'
      w='100%'
      mt={4}
      flexDirection='column'
      onSubmit={e => {
        e.preventDefault();
        const dates = selected;
        // automatically set start date to min if none is provided
        if (!dates[0]) {
          dates[0] = min;
        }
        // automatically set end date to max if none is provided
        if (!dates[1]) {
          dates[1] = max;
        }

        // Ensure end date doesn't exceed current year
        const endYear = parseInt(dates[1].split('-')[0]);
        if (endYear > currentYear) {
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
            colorScheme={colorScheme as string}
            bg='white'
            min={min}
            max={selected[1] || max}
            value={selected[0] === '-_exists_' ? '' : selected[0] || min}
            onChange={e => {
              let newSelection = [e.target.value, selected[1] || max];
              setSelected(newSelection);
            }}
            isDisabled={isDisabled}
          />
        </Box>
        <Box maxW='200px'>
          <Text fontSize='xs'>
            <label htmlFor='end'>End date:</label>
          </Text>
          <Input
            id='end'
            type='date'
            colorScheme={colorScheme as string}
            bg='white'
            min={selected[0] || min}
            max={max}
            value={selected[0] === '-_exists_' ? '' : selected[1] || max}
            onChange={e => {
              let newSelection = [selected[0] || min, e.target.value];
              if (e.target.value > max) {
                newSelection[1] = max;
              }
              setSelected(newSelection);
            }}
            isDisabled={isDisabled}
          />
        </Box>
      </Flex>
      <Flex alignItems='center' mt={2}>
        <Button
          size='sm'
          variant='solid'
          type='submit'
          colorScheme={colorScheme as string}
          mr={1}
          isDisabled={isDisabled}
        >
          Submit
        </Button>
        <Button
          size='sm'
          variant='outline'
          colorScheme={colorScheme as string}
          onClick={() => resetFilter()}
          isDisabled={isDisabled || !selectedDates.length}
          mx={1}
        >
          Reset
        </Button>
      </Flex>
    </Flex>
  );
};
