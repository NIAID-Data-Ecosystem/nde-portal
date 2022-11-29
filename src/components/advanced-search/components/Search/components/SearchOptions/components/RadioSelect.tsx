import { Radio } from '@chakra-ui/react';
import { Flex, useDisclosure } from 'nde-design-system';
import { useState } from 'react';
import {
  OptionItem,
  OptionsList,
  SelectWithButton,
} from 'src/components/select';
import { Option } from '../../AdvancedSearchFormContext';
import { RadioTooltip } from './RadioItem';

export const RadioSelect = ({
  options,
  updateSearchOption,
  searchOption,
  isDisabled,
}: {
  isDisabled?: boolean;
  options: Option[];
  searchOption: Option;
  updateSearchOption: (arg: Option) => void;
}) => {
  const disclosure = useDisclosure();
  const [selected, setSelected] = useState(options[0]);
  const values = options.map(o => o.value);

  return (
    <Flex>
      <Radio
        isChecked={values.includes(searchOption.value)}
        onChange={() => {
          updateSearchOption(selected);
        }}
        mr={2}
        isDisabled={isDisabled}
      />

      <SelectWithButton
        id='search-type'
        ariaLabel='Select type of text search'
        colorScheme='gray'
        _hover={{ bg: 'gray.100' }}
        _focus={{ boxShadow: 'none' }}
        name={selected.name}
        variant='outline'
        size='sm'
        justifyContent='space-between'
        p={2}
        isDisabled={isDisabled}
        {...disclosure}
      >
        <OptionsList zIndex='popover' w='unset' minW='100%'>
          {options.map(option => {
            return (
              <RadioTooltip
                key={option.value}
                description={option.description}
                example={option.example}
                isDisabled={!disclosure.isOpen}
              >
                <div>
                  <OptionItem
                    whiteSpace='nowrap'
                    name={option?.name || ''}
                    onClick={() => {
                      setSelected(option);
                      updateSearchOption(option);
                      disclosure.onClose();
                    }}
                  />
                </div>
              </RadioTooltip>
            );
          })}
        </OptionsList>
      </SelectWithButton>
    </Flex>
  );
};
