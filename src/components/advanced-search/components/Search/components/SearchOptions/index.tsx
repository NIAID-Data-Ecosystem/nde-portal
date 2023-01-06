import { RadioGroup } from '@chakra-ui/react';
import { Stack } from 'nde-design-system';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { RadioItem } from './components/RadioItem';
import { RadioSelect } from './components/RadioSelect';

export const SearchOptions: React.FC = () => {
  const { searchField, searchOption, searchOptionsList, setSearchOption } =
    useAdvancedSearchContext();

  return (
    <RadioGroup mb={4}>
      <Stack direction='row' spacing={6}>
        {searchOptionsList.map(option => {
          if (option.options && option.options.length) {
            return (
              <RadioSelect
                searchOption={searchOption}
                updateSearchOption={setSearchOption}
                options={option.options}
                // isDisabled={!searchField}
              />
            );
          }
          return (
            <RadioItem
              key={option.value}
              name={option.name}
              description={option.description}
              onChange={() => setSearchOption(option)}
              hasTooltip
              isDisabled={!searchField}
              isChecked={option.value === searchOption.value}
            />
          );
        })}
      </Stack>
    </RadioGroup>
  );
};
