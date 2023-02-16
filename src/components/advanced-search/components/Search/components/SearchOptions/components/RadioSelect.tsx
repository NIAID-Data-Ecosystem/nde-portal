import { Radio } from '@chakra-ui/react';
import { Flex, useDisclosure } from 'nde-design-system';
import { useEffect, useState } from 'react';
import {
  OptionItem,
  OptionsList,
  SelectWithButton,
} from 'src/components/select';
import { SearchTypesConfigProps } from '../../../search-types-config';
import { RadioTooltip } from './RadioItem';

export const RadioSelect = ({
  options,
  updateSearchOption,
  searchOption,
  isDisabled,
  isChecked,
}: {
  isDisabled?: boolean;
  isChecked: boolean;
  options: SearchTypesConfigProps[];
  searchOption: SearchTypesConfigProps;
  updateSearchOption: (arg: SearchTypesConfigProps) => void;
}) => {
  const disclosure = useDisclosure();
  const selectedOption = options.filter(
    option => option.id === searchOption.id,
  );
  const [selected, setSelected] = useState(selectedOption[0]);

  useEffect(() => {
    setSelected(selectedOption[0] || options[0]);
  }, [options, selectedOption]);

  return (
    <Flex>
      <Radio
        isChecked={isChecked}
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
        name={selected?.label}
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
                key={option.id}
                description={option.description}
                example={option.example}
                isDisabled={!disclosure.isOpen}
              >
                <div>
                  <OptionItem
                    whiteSpace='nowrap'
                    name={option?.label || ''}
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
