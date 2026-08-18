import { useState } from 'react';
import {
  Flex,
  NativeSelect,
  NumberInput as ChakraNumberInput,
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
  colorPalette,
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
    <Flex w='100%' alignItems='center' asChild>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit({
            term: `${operator.label} ${formatNumber(+count)}`,
            querystring: `${operator.value}${count}`,
          });
        }}
      >
        <NativeSelect.Root size='lg' mr={2} variant='outline'>
          <NativeSelect.Field
            colorPalette={colorPalette}
            disabled={isDisabled}
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
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <ChakraNumberInput.Root
          w='100%'
          maxW={150}
          value={formatNumber(+count, ' ')}
          onValueChange={details => {
            setCount(details.value);
          }}
          colorPalette={colorPalette}
          clampValueOnBlur={true}
          disabled={isDisabled}
          allowMouseWheel
          step={50}
          defaultValue='0'
          min={0}
          size='lg'
        >
          <ChakraNumberInput.Input />
          <ChakraNumberInput.Control>
            <ChakraNumberInput.IncrementTrigger />
            <ChakraNumberInput.DecrementTrigger />
          </ChakraNumberInput.Control>
        </ChakraNumberInput.Root>
        <Flex mx={2}>
          {renderSubmitButton &&
            renderSubmitButton({
              type: 'submit',
              w: '100%',
              isDisabled,
            })}
        </Flex>
      </form>
    </Flex>
  );
};
