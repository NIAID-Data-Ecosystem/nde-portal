import React from 'react';
import { Checkbox, Flex, Text } from '@chakra-ui/react';
import { DatePicker } from './date-picker';
import { formatNumber } from 'src/utils/helpers';
import { FilterItem } from '../../../types';

interface DateControlsProps {
  colorScheme: string;
  selectedDates: string[];
  resourcesWithNoDate: FilterItem[];
  onDateSelect: (dates: string[]) => void;
  onResetFilter: () => void;
}

export const DateControls: React.FC<DateControlsProps> = ({
  colorScheme,
  selectedDates,
  resourcesWithNoDate,
  onDateSelect,
  onResetFilter,
}) => {
  const handleToggleNoDateResources = (isChecked: boolean) => {
    let updatedDates = [...selectedDates];

    // If toggled when no selection is made, show only resources with dates
    if (selectedDates.length === 0) {
      updatedDates.push('_exists_');
    }
    // If toggled when resources with dates is showing, remove this filter
    else if (selectedDates.includes('_exists_')) {
      updatedDates = selectedDates.filter(d => !d.includes('_exists_'));
    }
    // User toggles to include/exclude resources with no dates
    else {
      if (updatedDates.includes('-_exists_')) {
        updatedDates = selectedDates.filter(d => !d.includes('-_exists_'));
      } else {
        updatedDates.push('-_exists_');
      }
    }

    onDateSelect(updatedDates);
  };

  const noDateCount =
    resourcesWithNoDate.length && resourcesWithNoDate[0].count
      ? formatNumber(resourcesWithNoDate[0].count)
      : '';

  const isNoDateCheckboxChecked =
    selectedDates.length === 0 || selectedDates.includes('-_exists_');

  return (
    <Flex bg='blackAlpha.50' flexDirection='column' px={4} py={2}>
      <DatePicker
        colorScheme={colorScheme}
        selectedDates={selectedDates}
        handleSelectedFilter={onDateSelect}
        resetFilter={onResetFilter}
      />

      {/* Checkbox to toggle items with/without dates. Default behavior shows all resources. */}
      <Checkbox
        mt={4}
        isChecked={isNoDateCheckboxChecked}
        onChange={e => handleToggleNoDateResources(e.target.checked)}
        isDisabled={!resourcesWithNoDate.length}
      >
        <Text fontSize='sm' fontWeight='medium' lineHeight='shorter'>
          Include {noDateCount} resources with no date information.
        </Text>
      </Checkbox>
    </Flex>
  );
};
