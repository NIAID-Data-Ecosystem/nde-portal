import {
  Box,
  Checkbox as ChakraCheckbox,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import { sendGTMEvent } from '@next/third-parties/google';
import React from 'react';
import { Tooltip } from 'src/components/tooltip';

import { FilterItem } from '../types';

// Memoized Checkbox component to prevent unnecessary re-renders
interface FilterCheckboxProps extends FilterItem {
  isLoading: boolean;
  isUpdating?: boolean;
  colorPalette?: string;
  filterName: string;
}

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

// Display the tooltip label for the filter term
const getTooltipLabel = (
  term: FilterItem['term'],
  filterName: FilterCheckboxProps['filterName'],
) => {
  const formattedName = capitalize(filterName.toLowerCase());

  if (term === '-_exists_') {
    return `${formattedName} not specified, missing, or unavailable.`;
  }

  if (term === '_exists_') {
    return `One or more ${formattedName} is specified, found, or available.`;
  }

  return null;
};

// Note: Requested by Andrew to track the usage of this filter option.
const trackGAEvent = (value: string, filterName: string) => {
  if (value.includes('_exists_') || value.includes('-_exists_')) {
    sendGTMEvent({
      label: filterName || 'unknown_filter',
      event: 'filter_checkbox_click',
      value:
        value === '_exists_'
          ? `Any Specified: ${filterName}`
          : `Not Specified: ${filterName}`,
      eventValue:
        value === '_exists_'
          ? `Any Specified: ${filterName}`
          : `Not Specified: ${filterName}`,
    });
  }
};

export const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({
    colorPalette,
    count,
    filterName,
    isHeader,
    isLoading,
    term,
    isUpdating,
    ...props
  }) => {
    let label = props.label;
    let subLabel = '';

    const tooltipContent = getTooltipLabel(term, filterName);

    // Display the header label for the group
    if (isHeader) {
      return (
        <Text
          px={6}
          fontSize='xs'
          fontWeight='semibold'
          lineHeight='shorter'
          pt={2}
          pb={1}
        >
          {label}
        </Text>
      );
    }

    // Split the label into scientific name and common name if it contains '|'
    if (term?.includes('|')) {
      const [scientificName, commonName] = props.label.split(' | ');
      label = commonName || props.label;
      subLabel = scientificName;
    } else if (term.includes('_exists_')) {
      label = `${props.label} ${filterName.toLowerCase()}`;
    }

    const isBusy = isLoading || isUpdating;

    return (
      <ChakraCheckbox.Root
        size='sm'
        onCheckedChange={() => {
          trackGAEvent(term, filterName);
        }}
        value={term}
        w='100%'
        px={6}
        pr={2}
        py={1.5}
        alignItems='flex-start'
        _hover={{
          bg: `${colorPalette}.50`,
        }}
        cursor={isBusy ? 'not-allowed' : 'pointer'}
      >
        <ChakraCheckbox.HiddenInput disabled={isBusy} />
        <ChakraCheckbox.Control mt='0.5' />
        {/* Loading skeleton only on load  */}
        <Tooltip content={tooltipContent}>
          <Stack gap='0.5' opacity={count ? 1 : 0.8} fontSize='xs' flex={1}>
            <ChakraCheckbox.Label fontSize='inherit'>
              {label ? capitalize(label) : 'Loading...'}
            </ChakraCheckbox.Label>

            {subLabel && (
              <Box textStyle='sm' color='fg.muted' fontSize='inherit'>
                {capitalize(subLabel)}
              </Box>
            )}
          </Stack>
        </Tooltip>

        {/* Display the count of the filter term */}
        <Tag.Root
          as='span'
          className='tag-count'
          colorPalette={colorPalette}
          borderRadius='full'
        >
          <Tag.Label>{count?.toLocaleString('en-US')}</Tag.Label>
        </Tag.Root>
      </ChakraCheckbox.Root>
    );
  },
);
