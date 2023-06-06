import {
  Button,
  Flex,
  FlexProps,
  Tag,
  TagCloseButton,
  TagLabel,
} from 'nde-design-system';
import { filtersConfig } from 'src/components/search-results-page/components/filters';
import { SelectedFilterType, SelectedFilterTypeValue, ValueOf } from '../types';
import REPOS from 'configs/repositories.json';
/*
[COMPONENT INFO]:
  When filters are applied to the data, we display tags/tags for each filter.
  Tags contain close option which when closed, toggle the filter off.
*/
// tags: [string, (string | number | { [key: string]: string | string[] })[]][];

interface FilterTags extends FlexProps {
  tags: [keyof SelectedFilterType, ValueOf<SelectedFilterType>][];
  removeAllFilters: () => void;
  removeSelectedFilter: (
    name: keyof SelectedFilterType,
    value: SelectedFilterTypeValue | SelectedFilterTypeValue[],
  ) => void;
}

export const FilterTags: React.FC<FilterTags> = ({
  tags,
  removeAllFilters,
  removeSelectedFilter,
  ...props
}) => {
  if (!tags) {
    return null;
  }

  return (
    <Flex pb={[4, 6]} flexWrap='wrap' {...props}>
      <Button
        m={1}
        variant='outline'
        colorScheme='secondary'
        onClick={removeAllFilters}
      >
        Clear All
      </Button>
      {tags.map(([key, values]) => {
        const name = filtersConfig[key]?.name || `${key}`;

        if (key === 'date') {
          const str = values.reduce((r: string, value) => {
            if (typeof value === 'string') {
              const year = value.split('-')[0];
              // if year is same as previous year, then condense it to just the year instead of "date to date" format
              if (r && year === r?.split('-')[0]) {
                r = year;
                return r;
              }
              return r + (r.length ? ` to ${value}` : value);
            }

            return r;
          }, '') as string;

          if (!str) {
            return <></>;
          }

          return (
            <Tag key={`${str}`} colorScheme='secondary' size='lg' m={1}>
              <TagLabel whiteSpace='break-spaces'>
                {name}: {str}
              </TagLabel>
              <TagCloseButton
                onClick={() => removeSelectedFilter(key, values)}
              />
            </Tag>
          );
        }

        return values.map(v => {
          let value = v || '';
          if (typeof v === 'object' && Object.keys(v)[0].includes('exists')) {
            value = 'Not Specified';
          } else if (key === 'includedInDataCatalog.name') {
            value = REPOS.repositories.find(repo => repo.id === v)?.label || v;
          }

          return (
            <Tag key={`${v}`} colorScheme='secondary' size='lg' m={1}>
              <TagLabel whiteSpace='break-spaces'>
                {name}
                {value ? `: ${value}` : ''}
              </TagLabel>
              <TagCloseButton onClick={() => removeSelectedFilter(key, v)} />
            </Tag>
          );
        });
      })}
    </Flex>
  );
};
