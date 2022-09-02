import {
  Button,
  Flex,
  FlexProps,
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

interface FilterTags extends FlexProps {
  tags: [string, (string | number)[]][];
  removeAllFilters: () => void;
  removeSelectedFilter: (name: string, value: string | number) => void;
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
    <Flex mb={[4, 6, 8]} flexWrap='wrap' {...props}>
      <Button
        m={1}
        variant='outline'
        colorScheme='secondary'
        onClick={removeAllFilters}
      >
        Clear All
      </Button>
      {tags.map(([key, values]) => {
        return values.map(v => {
          const name = filtersConfig[key]?.name || `${key}`;

          return (
            <Tag key={`${v}`} colorScheme='secondary' size='lg' m={1}>
              <TagLabel whiteSpace='break-spaces'>
                {name}
                {v ? `: ${v}` : ''}
              </TagLabel>
              <TagCloseButton onClick={() => removeSelectedFilter(key, v)} />
            </Tag>
          );
        });
      })}
    </Flex>
  );
};
