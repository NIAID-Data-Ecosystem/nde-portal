import React from 'react';
import {
  Checkbox as ChakraCheckbox,
  Skeleton,
  Tag,
  Text,
} from '@chakra-ui/react';
import { FilterItem } from 'src/views/search-results-page/components/filters/types';

// Memoized Checkbox component to prevent unnecessary re-renders
interface FilterCheckboxProps extends FilterItem {
  isLoading: boolean;
  isUpdating?: boolean;
  colorScheme?: string;
}
export const Checkbox: React.FC<FilterCheckboxProps> = React.memo(
  ({ colorScheme, count, isHeader, isLoading, term, isUpdating, ...props }) => {
    let label = props.label;
    let subLabel = '';

    // Display the header label for the group
    if (isHeader) {
      return (
        <Text
          px={6}
          fontSize='xs'
          fontWeight='semibold'
          lineHeight='shorter'
          py={1}
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
    }

    return (
      <ChakraCheckbox
        value={term}
        w='100%'
        px={6}
        pr={2}
        py={1}
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

          {/* Display the count of the filter term */}
          <Tag
            as='span'
            className='tag-count'
            variant='subtle'
            bg={`${colorScheme}.50`}
            colorScheme={colorScheme}
            borderRadius='full'
            fontSize='xs'
            alignSelf='flex-start'
            lineHeight={1.2}
            size='sm'
          >
            {count?.toLocaleString('en-US')}
          </Tag>
        </Skeleton>
      </ChakraCheckbox>
    );
  },
);
