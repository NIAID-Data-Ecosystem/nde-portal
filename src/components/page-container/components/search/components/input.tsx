import {
  Search as SearchWithDropdown,
  SearchBarWithDropdownProps,
} from 'src/components/search-bar';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

/**
 * Input component for search bar with dropdown
 * @param props SearchBarWithDropdownProps
 * @returns JSX.Element
 */
export const Input: React.FC<Partial<SearchBarWithDropdownProps>> = ({
  placeholder = 'Search for resources',
  ariaLabel = 'Search for resources',
  ...rest
}) => {
  return (
    <SearchWithDropdown.Input
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      size='md'
      showOptionsMenu
      showSearchHistory
      optionMenuProps={{
        buttonProps: {
          borderRadius: 'full',
          colorScheme: 'primary',
        },
        label: 'Type',
        description: SCHEMA_DEFINITIONS['type'].abstract['Dataset'],
        showSelectAll: true,
        options: [
          {
            name: 'Computational Tool Repository',
            value: 'ComputationalTool',
            property: '@type',
          },
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
        ],
      }}
      {...rest}
    />
  );
};
