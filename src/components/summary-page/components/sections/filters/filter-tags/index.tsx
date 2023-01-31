import { FilterTags as Tags, FilterTagsWrapper } from 'src/components/filters';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/components/filters/types';

interface FilterTagsProps {
  // Filters applied to data.
  filters: SelectedFilterType;
  // HandlerFn for updating filters.
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  // Remove existing applied filters.
  removeAllFilters: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  filters,
  removeAllFilters,
  updateFilters,
}) => {
  const filter_tags = Object.entries({
    ...filters,
    date:
      filters.date && filters.date.length > 0
        ? [`${filters.date[0]} to ${filters.date[filters.date.length - 1]}`]
        : [],
  });

  return (
    <FilterTagsWrapper filters={filters}>
      <Tags
        tags={filter_tags}
        removeAllFilters={() => removeAllFilters()}
        removeSelectedFilter={(
          name: keyof SelectedFilterType,
          value: SelectedFilterTypeValue | SelectedFilterTypeValue[],
        ) => {
          let updatedFilter = {
            [name]: filters[name].filter(v => v !== value),
          };
          // If date is removed we set the value to an empty array.
          if (name === 'date') {
            updatedFilter = { [name]: [] };
          }
          updateFilters(updatedFilter);
        }}
        mb={0}
      />
    </FilterTagsWrapper>
  );
};
