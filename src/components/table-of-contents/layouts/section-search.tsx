import { Box, Flex, Text } from '@chakra-ui/react';
import { SearchInput, SearchInputProps } from 'src/components/search-input';

interface SectionSearchProps extends SearchInputProps {
  data: any[];
}

export const SectionSearch: React.FC<SectionSearchProps> = ({
  ariaLabel,
  placeholder,
  data,
  size = 'sm',
  value,
  handleChange,
}) => {
  return (
    <Flex justifyContent='flex-end'>
      <Box w='300px'>
        <SearchInput
          size={size}
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          value={value}
          handleChange={handleChange}
          type='text'
        />
        <Text
          fontSize='xs'
          fontWeight='light'
          mt={1}
          color='gray.800'
          textAlign='right'
        >
          <Text as='span' fontWeight='medium'>
            {data.length}
          </Text>{' '}
          result{data.length === 1 ? '' : 's'}.
        </Text>
      </Box>
    </Flex>
  );
};
