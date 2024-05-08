import {
  Box,
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
import { FaCaretDown, FaFilter } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

interface CheckboxListProps {
  property: string;
  options: { name: string; value: string; count: number }[];
  label: string;
  selectedOptions: string[];
  handleChange: (filter: { [key: string]: string[] }) => void;
}

export const CheckboxList = ({
  label,
  options,
  property,
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
          <PopoverCloseButton m={2} />
          <PopoverHeader>
            <Text fontWeight='semibold' lineHeight='normal'>
              {label}
            </Text>
            <Text
              color='niaid.placeholder'
              fontStyle='italic'
              lineHeight='normal'
              mt={1}
            >
              Accessibility of the work.
            </Text>
          </PopoverHeader>
          <PopoverBody>
            <ScrollContainer maxHeight='300px'>
              <CheckboxGroup colorScheme='blue' value={selectedOptions}>
                <Stack spacing={1} direction={['column']} mx={1}>
                  {options.map(option => {
                    return (
                      <Checkbox
                        key={option.value}
                        value={option.value}
                        onChange={e => {
                          const options = [...selectedOptions];
                          if (e.target.checked) {
                            options.push(e.target.value);
                          } else {
                            const index = options.indexOf(e.target.value);
                            options.splice(index, 1);
                          }
                          handleChange({ [property]: options });
                        }}
                      >
                        {option.name}
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
