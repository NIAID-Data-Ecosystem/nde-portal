import React, { useEffect, useMemo, useState } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import {
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  ListItem,
  Tooltip,
} from 'nde-design-system';
import { useLocalStorage } from 'usehooks-ts';
import {
  DropdownContent,
  DropdownInput,
  DropdownInputProps,
  DropdownList,
  Highlight,
  InputWithDropdown,
  useDropdownContext,
} from '../input-with-dropdown';
import { IoMdClose } from 'react-icons/io';

interface RecentItemProps {
  colorScheme: string;
  index: number;
  searchTerm: string;
  value: string;
  onClick?: (arg: string) => void | undefined;
}
const RecentItem = ({
  colorScheme,
  index,
  searchTerm,
  value,
  onClick,
}: RecentItemProps) => {
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
      <Icon as={FaSearch} mr={2} color='primary.500'></Icon>
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
};

const SearchInput = ({ ...inputProps }: DropdownInputProps) => {
  const { isOpen, setIsOpen } = useDropdownContext();

  return (
    <Flex w='100%' alignItems='center'>
      <DropdownInput
        {...inputProps}
        renderSubmitButton={() => {
          return (
            <>
              <Button
                colorScheme={inputProps.colorScheme}
                aria-label={inputProps.ariaLabel}
                size={inputProps.size}
                type='submit'
                // onClick={inputProps.onSubmit}
              >
                Search
              </Button>
              <Divider orientation='vertical' borderColor='gray.200' m={1} />

              <Tooltip label='Toggle search history.'>
                <IconButton
                  variant='ghost'
                  size={inputProps.size}
                  aria-label='Toggle search history.'
                  icon={
                    <Flex px={2}>
                      <Icon as={FaHistory} />
                    </Flex>
                  }
                  onClick={() => setIsOpen(!isOpen)}
                />
              </Tooltip>
            </>
          );
        }}
      />
    </Flex>
  );
};

interface SearchBarProps extends SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  searchHistory: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
  searchHistory,
  setSearchHistory,
}: SearchBarProps) => {
  const router = useRouter();
  const { setIsOpen } = useDropdownContext();

  // Search term entered in search bar.
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Update value when changed.
  useEffect(() => {
    const { q } = router.query;
    setSearchTerm(prev => {
      if (q && router.query.advancedSearch !== 'true') {
        return q as string;
      }
      return prev;
    });
  }, [router]);

  const handleSubmit = (term: string) => {
    setSearchHistory(prev => {
      const newSearchHistory = uniq(
        [...prev, term].filter(recentSearch => recentSearch.trim().length > 0),
      );

      if (newSearchHistory.length > 5) {
        newSearchHistory.shift();
      }

      return newSearchHistory;
    });
    router.push({
      pathname: `/search`,
      query: { q: `${term.trim()}` },
    });
  };

  return (
    <>
      <SearchInput
        id='search-bar'
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        size={size}
        type='text'
        onChange={setSearchTerm}
        onSubmit={handleSubmit}
        getInputValue={(idx: number): string => {
          if (searchHistory && searchHistory[idx]) {
            return searchHistory[idx] || '';
          }
          return '';
        }}
      />

      <DropdownContent bg='#fff'>
        <DropdownList>
          <ListItem
            px={2}
            mx={2}
            my={1}
            display='flex'
            justifyContent='space-between'
          >
            <Heading
              as='h3'
              size='xs'
              fontStyle='italic'
              color={searchHistory.length ? 'primary.600' : 'gray.700'}
              fontWeight='medium'
            >
              {searchHistory.length
                ? 'Previous searches'
                : 'No previous searches.'}
            </Heading>
            <IconButton
              aria-label='Close search history.'
              icon={<Icon as={IoMdClose} />}
              variant='ghost'
              size='sm'
              onClick={() => setIsOpen(false)}
            />
          </ListItem>
          {searchHistory.map((recentSearch, i) => {
            return (
              <RecentItem
                key={i}
                index={i}
                colorScheme={colorScheme}
                searchTerm={searchTerm}
                value={recentSearch}
                onClick={value => handleSubmit(value)}
              />
            );
          })}
        </DropdownList>
      </DropdownContent>
    </>
  );
};

interface SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}

export const SearchBarWithDropdown = (props: SearchBarWithDropdownProps) => {
  const router = useRouter();
  const { q } = router.query;
  const defaultInputValue =
    q && router.query.advancedSearch !== 'true' ? (q as string) : '';

  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>(
    'basic-searches',
    [],
  );
  return (
    <InputWithDropdown
      inputValue={defaultInputValue}
      cursorMax={searchHistory.length}
      colorScheme={props.colorScheme}
    >
      <SearchBar
        searchHistory={searchHistory}
        setSearchHistory={setSearchHistory}
        {...props}
      />
    </InputWithDropdown>
  );
};
