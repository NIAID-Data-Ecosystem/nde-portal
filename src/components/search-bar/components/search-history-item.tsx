import React, { useMemo } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Highlight, Icon, InputProps, ListItem, Text } from '@chakra-ui/react';
import { useDropdownContext } from '../../input-with-dropdown';

interface SearchHistoryItemProps {
  colorPalette: InputProps['colorPalette'];
  index: number;
  searchTerm: string;
  value: string;
  onClick?: (arg: string) => void | undefined;
}
export const SearchHistoryItem = React.memo(
  ({
    colorPalette,
    index,
    searchTerm,
    value,
    onClick,
  }: SearchHistoryItemProps) => {
    const { cursor, getListItemProps, setInputValue } = useDropdownContext();
    const isSelected = useMemo(() => cursor === index, [index, cursor]);
    return (
      <ListItem
        display='flex'
        alignItems='flex-start'
        borderRadius='base'
        cursor='pointer'
        px={2}
        py={1}
        m={2}
        my={1}
        {...getListItemProps({
          index,
          value,
          isSelected,
          onClick: () => {
            setInputValue(value);
            onClick && onClick(value);
          },
        })}
      >
        <Icon
          as={FaMagnifyingGlass}
          mr={2}
          mt={1.5}
          color={`${colorPalette}.400`}
          boxSize={3}
        />
        <Text
          fontSize='sm'
          lineHeight='short'
          color='text.body'
          wordBreak='break-word'
          fontWeight='normal'
          textAlign='left'
          css={{
            '* > .search-term': {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorPalette}.400`,
              bg: 'transparent',
            },
          }}
        >
          <Highlight
            query={searchTerm.split(' ')}
            styles={{
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorPalette}.400`,
              bg: 'transparent',
            }}
          >
            {value}
          </Highlight>
        </Text>
      </ListItem>
    );
  },
);
