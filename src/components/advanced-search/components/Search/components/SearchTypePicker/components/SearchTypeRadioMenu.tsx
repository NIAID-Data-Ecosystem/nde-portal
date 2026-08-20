import { Flex, RadioGroup, useDisclosure } from '@chakra-ui/react';
import {
  OptionItem,
  OptionsList,
  SelectWithButton,
} from 'src/components/select';

import { SearchTypesConfigProps } from '../../../search-types-config';
import { SearchTypeTooltip } from './SearchTypeTooltip';

interface SearchTypeRadioMenuProps {
  /** Value the enclosing RadioGroup checks this item against. */
  value: string;
  disabled?: boolean;
  options: SearchTypesConfigProps[];
  selectedSearchType: SearchTypesConfigProps;
  onSearchTypeChange: (searchType: SearchTypesConfigProps) => void;
}

/**
 * A search type whose label is a dropdown of sub-types, e.g. "contains" and
 * its exact/starts-with/ends-with variants.
 */
export const SearchTypeRadioMenu = ({
  value,
  options,
  selectedSearchType,
  onSearchTypeChange,
  disabled,
}: SearchTypeRadioMenuProps) => {
  const { open, onToggle, onClose } = useDisclosure();

  // The sub-type shown on the button: the selected one, else the first.
  const selected =
    options.find(option => option.id === selectedSearchType.id) ?? options[0];

  return (
    <Flex>
      <RadioGroup.Item value={value} disabled={disabled} mr={2}>
        <RadioGroup.ItemHiddenInput />
        <RadioGroup.ItemIndicator />
        {/* Names the radio for screen readers; the button carries the visible label. */}
        <RadioGroup.ItemText srOnly>{selected?.label}</RadioGroup.ItemText>
      </RadioGroup.Item>
      <SelectWithButton
        id='search-type'
        label={selected?.label ?? ''}
        variant='outline'
        colorPalette='gray'
        size='sm'
        p={2}
        justifyContent='space-between'
        _hover={{ bg: 'gray.100' }}
        disabled={disabled}
        open={open}
        onToggle={onToggle}
        onClose={onClose}
      >
        <OptionsList zIndex='tooltip' w='unset' minW='100%'>
          {options.map(option => (
            <SearchTypeTooltip
              key={option.id}
              description={option.description}
              example={option.example}
              disabled={!open}
            >
              <div>
                <OptionItem
                  whiteSpace='nowrap'
                  name={option.label}
                  onClick={() => {
                    onSearchTypeChange(option);
                    onClose();
                  }}
                />
              </div>
            </SearchTypeTooltip>
          ))}
        </OptionsList>
      </SelectWithButton>
    </Flex>
  );
};
