import {
  Button,
  Collapse,
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
} from 'nde-design-system';
import { filtersConfig } from 'src/components/search-results-page/components/filters';

/*
[COMPONENT INFO]:
  When filters are applied to the data, we display tags/tags for each filter.
  Tags contain close option which when closed, toggle the filter off.
*/

interface FilterTags {
  tags: [string, (string | number)[]][];
  removeAllFilters: () => void;
  removeSelectedFilter: (name: string, value: string | number) => void;
}

export const FilterTags: React.FC<FilterTags> = ({
  tags,
  removeAllFilters,
  removeSelectedFilter,
}) => {
  if (!tags) {
    return null;
  }
  return (
    <Collapse in={tags.length > 0}>
      <Flex mb={[4, 6, 8]} flexWrap='wrap'>
        <Button
          m={1}
          variant='outline'
          colorScheme='secondary'
          onClick={removeAllFilters}
        >
          Clear All
        </Button>
        {tags.map(([filterName, filterValues]) => {
          return filterValues.map(v => {
            return (
              <Tag key={`${v}`} colorScheme='secondary' size='lg' m={1}>
                <TagLabel whiteSpace='break-spaces'>
                  {filtersConfig[filterName].name} : {v}
                </TagLabel>
                <TagCloseButton
                  onClick={() => removeSelectedFilter(filterName, v)}
                />
              </Tag>
            );
          });
        })}
      </Flex>
    </Collapse>
  );
};
