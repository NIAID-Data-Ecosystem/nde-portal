import React from 'react';
import { Flex, NativeSelect, SelectProps, Text } from '@chakra-ui/react';

interface SelectWithLabelProps extends SelectProps {
  id: string;
  label: string;
  handleChange: (value: string | number) => void;
  options: { name: string; value: string | number; tooltip?: string }[];
  value: string | number;
}

/*
 [COMPONENT INFO]: SelectWithLabel
  Handles a select input with a label and options and optional tooltips.
*/
export const SelectWithLabel = ({
  id,
  label,
  options,
  size = 'sm',
  value,
  handleChange,
  ...props
}: SelectWithLabelProps) => {
  return (
    <Flex alignItems='center' gap={2} cursor='pointer' asChild>
      <label htmlFor={id}>
        <Text as='span' fontSize='sm' whiteSpace='nowrap' color='gray.900'>
          {label}
        </Text>
        <NativeSelect.Root>
          <NativeSelect.Field
            id={id}
            aria-label={label}
            size={size}
            onValueChange={e => handleChange(e.target.value)}
            value={value}
            bg='white'
            borderColor='gray.200'
            borderRadius='semi'
            cursor='pointer'
            _hover={{ boxShadow: 'low' }}
            {...props}
          >
            {options.map(option => {
              return (
                <option
                  key={option.value}
                  title={option?.tooltip || ''}
                  value={option.value}
                >
                  {option.name}
                </option>
              );
            })}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </label>
    </Flex>
  );
};
