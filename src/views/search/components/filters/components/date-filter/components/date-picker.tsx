import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { formatISOString } from 'src/utils/api/helpers';

import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface DatePickerProps {
  colorPalette: string;
  selectedDates: string[];
  handleSelectedFilter: (arg: string[]) => void;
  resetFilter: () => void;
}

const EXIST_FILTERS = ['_exists_', '-_exists_'] as const;

export const DatePicker = ({
  colorPalette,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
}: DatePickerProps) => {
  const { allData } = useDateRangeContext();

  // Separate state for the actual input values
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');

  // Memoize min/max calculations
  const { min, max, currentYear } = useMemo(() => {
    const minDate = formatISOString((allData && allData[0]?.term) || '');
    const maxFromData = formatISOString(
      (allData && allData[allData.length - 1]?.term) || '',
    );
    const year = new Date().getFullYear();
    const maxYear = maxFromData ? parseInt(maxFromData.split('-')[0]) : year;
    const cappedYear = Math.min(maxYear, year);
    const maxDate = `${cappedYear}-12-31`;

    return {
      min: minDate,
      max: maxDate,
      currentYear: year,
    };
  }, [allData]);

  const disabled = !allData || !allData.length;

  // Extract actual date values (excluding _exists_ filters)
  const getActualDates = (dates: string[]) =>
    dates.filter(d => !EXIST_FILTERS.includes(d as any));

  useEffect(() => {
    const actualDates = getActualDates(selectedDates);
    setStartInputValue(actualDates[0] || min);
    setEndInputValue(actualDates[1] || max);
  }, [selectedDates, min, max]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let dates = [startInputValue || min, endInputValue || max];

    // Ensure end date doesn't exceed current year
    const endYear = parseInt(dates[1].split('-')[0]);
    if (endYear > currentYear) {
      dates[1] = max;
    }

    handleSelectedFilter(dates);
  };

  // Shared date input configuration
  const dateInputProps = {
    type: 'date' as const,
    colorPalette: colorPalette,
    bg: 'white',
    disabled,
  };

  return (
    <Flex id='date-picker' w='100%' mt={0} flexDirection='column' asChild>
      <form onSubmit={handleSubmit}>
        <Flex
          flexWrap='wrap'
          justifyContent='space-between'
          gap={2}
          maxW='500px'
        >
          <Box flex={1}>
            <Text fontSize='xs'>
              <label htmlFor='start'>Start date:</label>
            </Text>
            <Input
              id='start'
              {...dateInputProps}
              min={min}
              max={endInputValue || max}
              value={startInputValue}
              onChange={e => setStartInputValue(e.target.value)}
            />
          </Box>
          <Box flex={1}>
            <Text fontSize='xs'>
              <label htmlFor='end'>End date:</label>
            </Text>
            <Input
              id='end'
              {...dateInputProps}
              min={startInputValue || min}
              max={max}
              value={endInputValue}
              onChange={e => setEndInputValue(e.target.value)}
            />
          </Box>
        </Flex>
        <Flex alignItems='center' mt={2}>
          <Button
            size='sm'
            variant='solid'
            type='submit'
            colorPalette={colorPalette}
            mr={1}
            disabled={disabled}
          >
            Submit
          </Button>
          <Button
            size='sm'
            variant='outline'
            colorPalette={colorPalette}
            onClick={resetFilter}
            disabled={disabled || !selectedDates.length}
            mx={1}
          >
            Reset
          </Button>
        </Flex>
      </form>
    </Flex>
  );
};
