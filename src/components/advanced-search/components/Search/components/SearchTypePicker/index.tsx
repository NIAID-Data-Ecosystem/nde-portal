import { RadioGroup, Stack } from '@chakra-ui/react';
import React from 'react';

import { SearchTypesConfigProps } from '../../search-types-config';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { SearchTypeRadio } from './components/SearchTypeRadio';
import { SearchTypeRadioMenu } from './components/SearchTypeRadioMenu';

export const SearchTypePicker: React.FC = () => {
  const {
    queryValue,
    selectedSearchType,
    setSelectedSearchType,
    searchTypeOptions,
  } = useAdvancedSearchContext();

  const options = searchTypeOptions.filter(
    option => !option.shouldOmit?.(queryValue),
  );

  // A search type is checked when it -- or one of its sub-types -- is selected.
  const checkedOption = options.find(
    option =>
      option.id === selectedSearchType.id ||
      option.options?.some(({ id }) => id === selectedSearchType.id),
  );

  // Checking a search type with sub-types commits its selected sub-type, or its first.
  const resolveSelection = (option: SearchTypesConfigProps) =>
    option.options?.length
      ? option.options.find(({ id }) => id === selectedSearchType.id) ??
        option.options[0]
      : option;

  return (
    <RadioGroup.Root
      mb={4}
      value={checkedOption?.id ?? null}
      onValueChange={({ value }) => {
        const option = options.find(({ id }) => id === value);
        if (option) {
          setSelectedSearchType(resolveSelection(option));
        }
      }}
    >
      <Stack direction={{ base: 'column', md: 'row' }} gap={6}>
        {options.map(option =>
          option.options?.length ? (
            <SearchTypeRadioMenu
              key={option.id}
              value={option.id}
              options={option.options}
              selectedSearchType={selectedSearchType}
              onSearchTypeChange={setSelectedSearchType}
            />
          ) : (
            <SearchTypeRadio
              key={option.id}
              value={option.id}
              label={option.label}
              description={option.description}
              example={option.example}
              disabled={option.shouldDisable?.(queryValue)}
            />
          ),
        )}
      </Stack>
    </RadioGroup.Root>
  );
};
