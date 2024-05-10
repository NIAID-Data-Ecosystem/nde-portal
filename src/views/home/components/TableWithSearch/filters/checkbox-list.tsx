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
} from '@chakra-ui/react';
import { FaCaretDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

interface CheckboxListProps {
  property: string;
  description?: string;
  options: { name: string; value: string; count: number }[];
  label: string;
  selectedOptions: { name: string; value: string; property: string }[];
  handleChange: (filters: {
    name: string;
    value: string;
    property: string;
  }) => void;
}

export const CheckboxList = ({
  label,
  options,
  property,
  description,
  handleChange,
  selectedOptions,
}: CheckboxListProps) => {
  return (
    <Flex flex={{ base: 1, sm: 'unset' }} height={{ base: 'unset' }}>
      <Popover>
        <PopoverTrigger>
          <Button
            colorScheme='gray'
            flex={1}
            fontWeight='medium'
            lineHeight='shorter'
            size='md'
            px={4}
            rightIcon={<FaCaretDown />}
            variant='outline'
            justifyContent='space-between'
          >
            {label}
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
                  {options.map(option => {
                    return (
                      <Checkbox
                        key={option.value}
                        value={option.value}
                        onChange={e => {
                          handleChange({
                            name: option.name,
                            property,
                            value: e.target.value,
                          });
                        }}
                        px={1}
                        _hover={{ bg: 'tertiary.50' }}
                      >
                        <Text fontSize='sm'>{option.name}</Text>
                      </Checkbox>
                    );
                  })}
                </Stack>
              </CheckboxGroup>
            </ScrollContainer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
