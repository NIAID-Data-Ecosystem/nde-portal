import { useMemo } from 'react';
import {
  Button,
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  FlexProps,
} from '@chakra-ui/react';
import { queryFilterObject2String } from 'src/components/filters/helpers';
import { defaultQuery } from 'src/components/search-results-page/helpers';
import { OLD_FILTERS_CONFIG } from 'src/components/search-results-page/components/filters/helpers';
import { SelectedFilterType, SelectedFilterTypeValue } from '../types';

interface FilterTagsProps extends FlexProps {
  selectedFilters: SelectedFilterType;
  handleRouteUpdate: (update: Record<string, any>) => void;
  removeAllFilters: () => void;
}

interface TagInfo {
  key: string;
  filterKey: string;
  name: string;
  value: string | SelectedFilterTypeValue | SelectedFilterTypeValue[];
  displayValue: string;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  handleRouteUpdate,
  selectedFilters,
  removeAllFilters,
  ...props
}) => {
  const tags: TagInfo[] = useMemo(() => {
    return Object.entries(selectedFilters).reduce(
      (acc: TagInfo[], [key, values]) => {
        const filterConfig = OLD_FILTERS_CONFIG[key];
        const filterName = filterConfig?.name || key;
        // Filter out date tags that have a single value such as "exists" and not "exists"
        if (
          key === 'date' &&
          values.length === 1 &&
          (Object.keys(values[0]).includes('_exists_') ||
            Object.keys(values[0]).includes('-_exists_'))
        ) {
          return acc;
        }

        values.forEach((v, index) => {
          let displayValue: string | SelectedFilterTypeValue = '';
          let value = v as SelectedFilterTypeValue | SelectedFilterTypeValue[];
          if (typeof value === 'object') {
            const objectKey = Object.keys(value)[0];
            displayValue = objectKey.startsWith('-_exists_')
              ? 'Not Specified'
              : 'Any Specified';
          } else if (
            key === 'date' &&
            values.length === 2 &&
            JSON.stringify(values[0]).substring(0, 4) ===
              JSON.stringify(values[1]).substring(0, 4)
          ) {
            if (index > 0) return;
            // if its the same year, month, and day, then it's a date range
            displayValue = `From ${values[0]} to ${values[1]}`;
            value = values;
          } else if (value.includes(' | ') && key.includes('displayName')) {
            // handle display name filters
            const [commonName, scientificName] = value.split(' | ');
            displayValue = `${
              scientificName.charAt(0).toUpperCase() + scientificName.slice(1)
            } ( ${commonName.charAt(0).toUpperCase() + commonName.slice(1)} )`;
          } else {
            displayValue = value;
          }

          acc.push({
            key: `${key}-${index}`,
            filterKey: key,
            name: filterName,
            value,
            displayValue: displayValue,
          });
        });

        return acc;
      },
      [],
    );
  }, [selectedFilters]);

  const removeSelectedFilter = (
    filterKey: string,
    filterValue: SelectedFilterTypeValue | SelectedFilterTypeValue[],
  ) => {
    const updatedFilters: SelectedFilterType = { ...selectedFilters };
    updatedFilters[filterKey] = updatedFilters[filterKey].filter(v => {
      if (Array.isArray(filterValue)) {
        return !filterValue.includes(v);
      } else if (typeof filterValue === 'object' || v === 'object') {
        return JSON.stringify(v) !== JSON.stringify(filterValue);
      }
      return v !== filterValue;
    });
    handleRouteUpdate({
      from: defaultQuery.selectedPage,
      filters: queryFilterObject2String(updatedFilters),
    });
  };

  if (!tags.length) return null;

  return (
    <Flex pb={[4, 6]} flexWrap='wrap' {...props}>
      <Button
        m={1}
        variant='outline'
        size='md'
        px={3}
        py={2}
        fontSize='sm'
        fontWeight='medium'
        colorScheme='secondary'
        onClick={removeAllFilters}
      >
        Clear All
      </Button>
      {tags.map(({ key, name, value, displayValue, filterKey }) => (
        <Tag key={key} colorScheme='secondary' size='md' m={1}>
          <TagLabel>{`${name}: ${
            typeof displayValue === 'string'
              ? displayValue
              : JSON.stringify(displayValue)
          }`}</TagLabel>
          <TagCloseButton
            onClick={() => removeSelectedFilter(filterKey, value)}
          />
        </Tag>
      ))}
    </Flex>
  );
};
