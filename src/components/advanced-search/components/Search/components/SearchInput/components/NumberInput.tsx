import { useState } from 'react';
import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from '@chakra-ui/react';

import { AdvancedSearchInputProps } from '../types';
import { formatNumber } from 'src/utils/helpers';

interface NumberInputProps extends AdvancedSearchInputProps {
  options?: {
    label: string;
    value: string;
  }[];
}

export const NumberInput: React.FC<NumberInputProps> = ({
  isDisabled,
  colorScheme,
  size,
  handleSubmit,
  renderSubmitButton,
}) => {
  const options = [
    { label: 'Equal to', value: '' },
    { label: 'Bigger than', value: '>' },
    { label: 'Bigger or Equal to', value: '>=' },
    { label: 'Smaller or Equal to', value: '<=' },
    { label: 'Smaller than', value: '<' },
  ];

  const [count, setCount] = useState<string>('0');
  const [operator, setOperator] = useState<(typeof options)[number]>(
    options[0],
  );

  return (
    <Flex
      as='form'
      w='100%'
      alignItems='center'
      onSubmit={e => {
        e.preventDefault();
        handleSubmit({
          term: `${operator.label} ${formatNumber(+count)}`,
          querystring: `${operator.value}${count}`,
        });
      }}
    >
      <Select
        colorScheme={colorScheme}
        // bg={colorScheme ? `${colorScheme}.50` : `gray.100`}
        size='lg'
        mr={2}
        variant='outline'
        isDisabled={isDisabled}
        value={options.findIndex(option => option.label === operator.label)}
        onChange={e => {
          setOperator(options[+e.target.value]);
        }}
        fontWeight='semibold'
      >
        {options.map((option, index) => {
          return (
            <option key={option.label} value={index}>
              {option.label} {option.value || '='}
            </option>
          );
        })}
      </Select>
      <ChakraNumberInput
        w='100%'
        maxW={150}
        value={formatNumber(+count, ' ')}
        onChange={value => {
          setCount(value);
        }}
        colorScheme={colorScheme} // [to do] - implement colorscheme.
        clampValueOnBlur={true}
        isDisabled={isDisabled}
        allowMouseWheel
        step={50}
        defaultValue={0}
        min={0}
        size='lg'
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </ChakraNumberInput>
      <Flex mx={2}>
        {renderSubmitButton &&
          renderSubmitButton({
            type: 'submit',
            w: '100%',
            isDisabled,
          })}
      </Flex>
    </Flex>
  );
};
