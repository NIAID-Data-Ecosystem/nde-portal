import { RadioGroup } from '@chakra-ui/react';
import { Stack } from 'nde-design-system';
import React from 'react';
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
  console.log('selectedSearchType', selectedSearchType);

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
      <Stack direction='row' spacing={6}>
        {searchTypeOptions
          .filter(
            option =>
              !(option.shouldOmit && option.shouldOmit(queryValue.field)),
          )
          .map(option => {
            // if (option.options && option.options.length) {
            //   return (
            //     <RadioSelect
            //       key='select'
            //       searchOption={selectedSearchType}
            //       updateSearchOption={setSelectedSearchType}
            //       options={option.options}
            //       // isDisabled={
            //       //   (option.shouldDisable &&
            //       //     option.shouldDisable(queryValue.field)) ||
            //       //   false
            //       // }
            //     />
            //   );
            // }

            return (
              <RadioItem
                key={option.id}
                label={option.label}
                description={option.description}
                // value={option.label}
                onChange={() => setSelectedSearchType(option)}
                hasTooltip
                isDisabled={
                  option.shouldDisable && option.shouldDisable(queryValue.field)
                }
                // isFocusable={false}
                isChecked={option.label === selectedSearchType.label}
              />
            );
          })}
      </Stack>
    </RadioGroup>
  );
};
