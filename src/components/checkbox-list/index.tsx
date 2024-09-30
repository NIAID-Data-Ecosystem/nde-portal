import {
  Button,
  CheckboxGroup,
  Checkbox,
  Flex,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Text,
  FlexProps,
  PopoverProps,
  ButtonProps,
} from '@chakra-ui/react';
import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
interface Option {
  name: string;
  value: string;
  count?: number;
}

interface Option {
  name: string;
  value: string;
  count?: number;
}

interface Option {
  name: string;
  value: string;
  count?: number;
}

interface Option {
  name: string;
  value: string;
  count?: number;
}

interface CheckboxListProps<T extends Option> extends FlexProps {
  buttonProps?: ButtonProps;
  description?: string;
  handleChange: (filters: T) => void;
  label: string | React.ReactNode;
  options: T[];
  selectedOptions: Pick<T, 'name' | 'value'>[];
  size?: PopoverProps['size'];
}

export const CheckboxList = <T extends Option>({
  label,
  options,
  description,
  handleChange,
  selectedOptions,
  size = 'md',
  buttonProps,
  ...rest
}: CheckboxListProps<T>) => {
  return (
    <Flex flex={{ base: 1, sm: 'unset' }} height={{ base: 'unset' }} {...rest}>
      <Popover>
        <PopoverTrigger>
          <Button
            colorScheme='gray'
            flex={1}
            fontWeight='medium'
            fontSize='inherit'
            lineHeight='shorter'
            size={size}
            px={4}
            rightIcon={<FaCaretDown />}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            {buttonProps?.children || label}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontWeight='semibold' lineHeight='normal' my={1}>
              {label}
            </Text>
            {description && (
              <Text
                color='niaid.placeholder'
                fontSize='sm'
                fontStyle='italic'
                fontWeight='normal'
                lineHeight='short'
                mt={1.5}
              >
                {description}
              </Text>
            )}
          </PopoverHeader>
          <PopoverBody>
            <ScrollContainer maxHeight='300px'>
              <CheckboxGroup
                colorScheme='blue'
                value={selectedOptions.map(item => item.value)}
              >
                <Stack spacing={1} direction='column'>
                  {options.map(option => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      onChange={e => {
                        handleChange({
                          name: option.name,
                          value: e.target.value,
                        } as T);
                      }}
                      px={1}
                      _hover={{ bg: 'tertiary.50' }}
                    >
                      <Text fontSize='sm'>{option.name}</Text>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </ScrollContainer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
