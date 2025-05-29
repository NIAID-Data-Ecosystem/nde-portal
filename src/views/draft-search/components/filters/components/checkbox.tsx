import React, { useCallback } from 'react';
import {
  Checkbox as ChakraCheckbox,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react';
import { sendGTMEvent } from '@next/third-parties/google';
import Tooltip from 'src/components/tooltip';
import { FilterItem } from '../types';

// Memoized Checkbox component to prevent unnecessary re-renders
interface FilterCheckboxProps extends FilterItem {
  isLoading: boolean;
  isUpdating?: boolean;
  colorScheme?: string;
  filterName: string;
}

// Display the tooltip label for the filter term
const getTooltipLabel = (
  term: FilterItem['term'],
  filterName: FilterCheckboxProps['filterName'],
) => {
  if (term === '-_exists_') {
    const name =
      filterName.charAt(0).toUpperCase() + filterName.slice(1).toLowerCase();
    return <>{name} not specified, missing, or unavailable.</>;
  } else if (term === '_exists_') {
    return (
      <>
        One or more {filterName.toLocaleLowerCase()} is specified, found, or
        available.
      </>
    );
  }
  return '';
};

export const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({
    colorScheme,
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
    // Note: Requested by Andrew to track the usage of this filter option.
    const trackGAEvent = useCallback((value: string, filterName: string) => {
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
    }, []);

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

    return (
      <ChakraCheckbox
        onChange={() => {
          trackGAEvent(term, filterName);
        }}
        value={term}
        w='100%'
        px={6}
        pr={2}
        py={1.5}
        alignItems='flex-start'
        _hover={{
          bg: `${colorScheme}.50`,
        }}
        sx={{
          '>.chakra-checkbox__control': {
            mt: 1, // to keep checkbox in line with top of text for options with multiple lines
          },
          '>.chakra-checkbox__label': {
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            opacity: count ? 1 : 0.8,
          },
        }}
      >
        {/* Loading skeleton only on load  */}
        <Skeleton
          isLoaded={!isLoading || isUpdating}
          display='flex'
          alignItems='center'
          flex={1}
        >
          <Tooltip label={getTooltipLabel(term, filterName)}>
            <Text
              as='span'
              flex={1}
              wordBreak='break-word'
              color='text.heading'
              fontSize='xs'
              lineHeight='short'
              mr={0.5}
              display='flex'
              flexDirection='column'
              fontWeight={subLabel ? 'semibold' : 'normal'}
            >
              {label
                ? label.charAt(0).toUpperCase() + label.slice(1)
                : 'Loading...'}
              {subLabel && (
                <Text
                  as='span'
                  flex={1}
                  wordBreak='break-word'
                  color='text.heading'
                  fontSize='xs'
                  lineHeight='short'
                  fontWeight='normal'
                  mr={0.5}
                >
                  {subLabel.charAt(0).toUpperCase() + subLabel.slice(1)}
                </Text>
              )}
            </Text>
          </Tooltip>

          {/* Display the count of the filter term */}
          <Tag
            as='span'
            className='tag-count'
            variant='subtle'
            size='sm'
            colorScheme={colorScheme}
            borderRadius='full'
            alignSelf='flex-start'
          >
            {count?.toLocaleString('en-US')}
          </Tag>
        </Skeleton>
      </ChakraCheckbox>
    );
  },
);
