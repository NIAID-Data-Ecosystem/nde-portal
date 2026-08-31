import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import {
  Search as SearchWithDropdown,
  SearchBarWithDropdownProps,
} from 'src/components/search-bar';
import {
  SHOW_DATA_COLLECTIONS_TAB,
  SHOW_SAMPLES_TAB,
} from 'src/utils/feature-flags';

/**
 * Input component for search bar with dropdown
 * @param props SearchBarWithDropdownProps
 * @returns JSX.Element
 */
export const Input: React.FC<Partial<SearchBarWithDropdownProps>> = ({
  placeholder = 'Search for resources',
  ariaLabel = 'Search for resources',
  size = 'sm',
  ...rest
}) => {
  return (
    <SearchWithDropdown.Input
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      size={size}
      showOptionsMenu
      showSearchHistory
      optionMenuProps={{
        label: 'Type',
        description: SCHEMA_DEFINITIONS['type'].abstract['Dataset'],
        showSelectAll: true,
        size,
        options: [
          {
            name: 'Computational Tool Repository',
            value: 'ComputationalTool',
            property: '@type',
          },
          ...(SHOW_DATA_COLLECTIONS_TAB
            ? [
                {
                  name: 'Data Collection',
                  value: 'DataCollection',
                  property: '@type',
                },
              ]
            : []),
          {
            name: 'Dataset Repository',
            value: 'Dataset',
            property: '@type',
          },
          {
            name: 'Resource Catalog',
            value: 'ResourceCatalog',
            property: '@type',
          },
          ...(SHOW_SAMPLES_TAB
            ? [
                {
                  name: 'Sample Repository',
                  value: 'Sample',
                  property: '@type',
                },
              ]
            : []),
        ],
      }}
      {...rest}
    />
  );
};
