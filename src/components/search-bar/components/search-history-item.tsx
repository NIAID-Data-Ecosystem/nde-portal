import React, { useMemo } from 'react';
import { Heading, Icon, ListItem } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useDropdownContext } from '../../input-with-dropdown';

const Highlight = dynamic(() =>
  import('src/components/input-with-dropdown/components/Highlight').then(
    mod => mod.Highlight,
  ),
);
interface SearchHistoryItemProps {
  colorScheme: string;
  index: number;
  searchTerm: string;
  value: string;
  onClick?: (arg: string) => void | undefined;
}
export const SearchHistoryItem = React.memo(
  ({
    colorScheme,
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
        alignItems='center'
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
        <Icon as={FaMagnifyingGlass} mr={2} color='primary.500'></Icon>
        <Heading
          as='h4'
          size='sm'
          lineHeight='short'
          color='text.body'
          wordBreak='break-word'
          fontWeight='normal'
          textAlign='left'
          sx={{
            '* > .search-term': {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: `${colorScheme}.400`,
              bg: 'transparent',
            },
          }}
        >
          <Highlight tags={searchTerm.split(' ')}>{value}</Highlight>
        </Heading>
      </ListItem>
    );
  },
);
