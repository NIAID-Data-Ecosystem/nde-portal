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
    value: SelectedFilterTypeValue,
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
    <Flex
      pb={[4, 6]}
      flexWrap='wrap'
      borderBottom='1px solid'
      borderBottomColor='gray.200'
      {...props}
    >
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
          return <></>;
          // return (
          //   <Tag
          //     key={`${values.join('-')}`}
          //     colorScheme='secondary'
          //     size='lg'
          //     m={1}
          //   >
          //     <TagLabel whiteSpace='break-spaces'>
          //       {name}: {values.join(' to ')}
          //     </TagLabel>
          //     <TagCloseButton onClick={() => removeSelectedFilter(key, '')} />
          //   </Tag>
          // );
        }

        return values.map(v => {
          let value = v || '';
          if (typeof v === 'object' && Object.keys(v)[0].includes('exists')) {
            value = 'None';
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
