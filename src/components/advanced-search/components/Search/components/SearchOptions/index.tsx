import React from 'react';
import { RadioGroup, Stack } from '@chakra-ui/react';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { RadioItem } from './components/RadioItem';
import { RadioSelect } from './components/RadioSelect';

export const SearchOptions: React.FC = () => {
  const {
    queryValue,
    selectedSearchType,
    setSelectedSearchType,
    searchTypeOptions,
  } = useAdvancedSearchContext();

  return (
    <RadioGroup
      mb={4}
      onChange={value => {
        const option = searchTypeOptions.find(option => option.label === value);
        if (option) {
          setSelectedSearchType(option);
        }
      }}
    >
      <Stack direction={['column', 'column', 'row']} spacing={6}>
        {searchTypeOptions
          .filter(
            option => !(option.shouldOmit && option.shouldOmit(queryValue)),
          )
          .map(option => {
            if (option.options && option.options.length) {
              return (
                <RadioSelect
                  key='select'
                  searchOption={selectedSearchType}
                  updateSearchOption={setSelectedSearchType}
                  options={option.options}
                  isChecked={
                    option.id === selectedSearchType.id ||
                    option.options.findIndex(
                      ({ id }) => id === selectedSearchType.id,
                    ) > -1
                  }
                />
              );
            }

            return (
              <RadioItem
                key={option.id}
                label={option.label}
                description={option.description}
                onChange={() => setSelectedSearchType(option)}
                hasTooltip
                isDisabled={
                  option.shouldDisable && option.shouldDisable(queryValue)
                }
                isChecked={option.label === selectedSearchType.label}
              />
            );
          })}
      </Stack>
    </RadioGroup>
  );
};
