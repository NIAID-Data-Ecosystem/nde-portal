import { RadioGroup } from '@chakra-ui/react';
import { Stack } from 'nde-design-system';
import { getPropertyInConfig } from 'src/utils/metadata-schema';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { RadioItem } from './components/RadioItem';
import { RadioSelect } from './components/RadioSelect';
import MetadataConfig from 'configs/resource-metadata.json';

export const SearchOptions: React.FC = () => {
  const { searchField, searchOption, searchOptionsList, setSearchOption } =
    useAdvancedSearchContext();

  const searchFieldDetails = searchField
    ? getPropertyInConfig(searchField, MetadataConfig)
    : null;

  const type = searchFieldDetails?.type;

  return (
    <RadioGroup mb={4}>
      <Stack direction='row' spacing={6}>
        {searchOptionsList.map(option => {
          if (option.options) {
            return (
              <RadioSelect
                searchOption={searchOption}
                updateSearchOption={setSearchOption}
                options={option.options}
                isDisabled={!searchField}
              />
            );
          }
          return (
            <RadioItem
              key={option.value}
              {...option}
              value={option.value}
              onChange={() => setSearchOption(option)}
              hasTooltip
              isDisabled={!searchField}
            />
          );
        })}
      </Stack>
    </RadioGroup>
  );
};
