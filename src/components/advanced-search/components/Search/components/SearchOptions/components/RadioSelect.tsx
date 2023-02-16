import { Radio } from '@chakra-ui/react';
import { Flex, useDisclosure } from 'nde-design-system';
import { useEffect, useState } from 'react';
import {
  OptionItem,
  OptionsList,
  SelectWithButton,
} from 'src/components/select';
import { SearchOption } from '../../AdvancedSearchFormContext';
import { RadioTooltip } from './RadioItem';

export const RadioSelect = ({
  options,
  updateSearchOption,
  searchOption,
  isDisabled,
}: {
  isDisabled?: boolean;
  options: SearchOption[];
  searchOption: SearchOption;
  updateSearchOption: (arg: SearchOption) => void;
}) => {
  const disclosure = useDisclosure();
  const selectedOption = options.filter(
    option => option.value === searchOption.value,
  );
  const [selected, setSelected] = useState(selectedOption[0]);
  const values = options.map(o => o.value);

  useEffect(() => {
    setSelected(selectedOption[0]);
  }, [selectedOption]);

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
        colorScheme='gray'
        _hover={{ bg: 'gray.100' }}
        _focus={{ boxShadow: 'none' }}
        name={selected?.name}
        variant='outline'
        size='sm'
        justifyContent='space-between'
        p={2}
        isDisabled={isDisabled}
        isOpen={disclosure.isOpen}
        onToggle={disclosure.onToggle}
        onClose={disclosure.onClose}
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
