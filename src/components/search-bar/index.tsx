import React, { useEffect, useMemo, useState } from 'react';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { uniq } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
} from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import {
  DropdownInput,
  DropdownInputProps,
  InputWithDropdown,
  useDropdownContext,
} from '../input-with-dropdown';
import { SearchHistoryItem } from './components/search-history-item';
import { CheckboxList, CheckboxListProps } from '../checkbox-list';
import { queryFilterObject2String } from 'src/views/search-results-page/helpers';

const DropdownContent = dynamic(() =>
  import('src/components/input-with-dropdown/components/DropdownContent').then(
    mod => mod.DropdownContent,
  ),
);

interface SearchInputProps extends DropdownInputProps {
  showSearchHistory?: boolean;
  showOptionsMenu?: boolean;
  optionMenuProps?: CheckboxListProps<OptionProps>;
}
const SearchInput = ({
  showSearchHistory,
  showOptionsMenu,
  optionMenuProps,
  ...inputProps
}: SearchInputProps) => {
  const { isOpen, setIsOpen } = useDropdownContext();
  return (
    <DropdownInput
      {...inputProps}
      onClose={() => {
        setIsOpen(false);
      }}
      renderSubmitButton={() => {
        return (
          <HStack height='100%'>
            {showOptionsMenu && optionMenuProps && (
              <CheckboxList {...optionMenuProps}></CheckboxList>
            )}
            <Button
              colorScheme={inputProps.colorScheme}
              aria-label={inputProps.ariaLabel}
              size={inputProps.size}
              type='submit'
              display={{ base: 'none', md: 'flex' }}
            >
              Search
            </Button>
            {showSearchHistory && (
              <Flex borderLeft='1px solid' borderLeftColor='gray.200' pl={1}>
                <Tooltip label='Toggle search history.'>
                  <IconButton
                    variant='ghost'
                    size={inputProps.size}
                    aria-label='Toggle search history.'
                    icon={
                      <Flex px={2}>
                        <Icon as={FaClockRotateLeft} />
                      </Flex>
                    }
                    onClick={() => setIsOpen(!isOpen)}
                  />
                </Tooltip>
              </Flex>
            )}
          </HStack>
        );
      }}
    />
  );
};

interface SearchBarProps extends SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  searchHistory?: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
  optionMenuProps,
  searchHistory,
  setSearchHistory,
  showOptionsMenu,
  showSearchHistory,
}: SearchBarProps) => {
  const router = useRouter();
  const { isOpen, setIsOpen } = useDropdownContext();
  // Search term entered in search bar.
  const [searchTerm, setSearchTerm] = useState<string>('');

  /****** Handle query filters ******/
  const [queryFilters, setQueryFilters] = useState<
    { name: string; value: string; property: string }[]
  >([]);

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
      query: {
        q: `${term.trim()}`,
        filters: queryFilterObject2String({
          '@type': queryFilters
            .filter(item => item.property === '@type')
            ?.map(filter => filter.value),
        }),
      },
    });
  };
  const historyList = useMemo(
    () =>
      showSearchHistory && searchHistory ? [...searchHistory].reverse() : [],
    [searchHistory, showSearchHistory],
  );

  return (
    <>
      <SearchInput
        id='search-bar'
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        size={size}
        type='text'
        showSearchHistory={showSearchHistory}
        showOptionsMenu={showOptionsMenu}
        optionMenuProps={
          optionMenuProps
            ? {
                selectedOptions:
                  queryFilters?.filter(item => item.property === '@type') || [],
                handleChange: setQueryFilters,
                ...optionMenuProps,
              }
            : undefined
        }
        onChange={setSearchTerm}
        onSubmit={handleSubmit}
        getInputValue={(idx: number): string => {
          if (historyList && historyList[idx]) {
            return historyList[idx] || '';
          }
          return '';
        }}
      />

      {isOpen && showSearchHistory && historyList && (
        <DropdownContent>
          <UnorderedList ml={0}>
            <ListItem
              px={2}
              mx={2}
              my={1}
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Text
                fontSize='xs'
                fontStyle='italic'
                color='primary.600'
                fontWeight='medium'
              >
                {historyList.length
                  ? 'Previous searches'
                  : 'No previous searches.'}
              </Text>
              {/* <IconButton
                aria-label='Close search history.'
                icon={<Icon as={FaXmark} />}
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
              /> */}
            </ListItem>
            {historyList.map((str, index) => {
              return (
                <SearchHistoryItem
                  key={str}
                  index={index}
                  colorScheme={colorScheme}
                  searchTerm={searchTerm}
                  value={str}
                  onClick={value => handleSubmit(value)}
                />
              );
            })}
          </UnorderedList>
        </DropdownContent>
      )}
    </>
  );
};

// Define the type for individual options in the checkbox list
interface OptionProps {
  name: string; // Display name for the option
  value: string; // Unique value identifier for the option
  property: string; // Associated property name (e.g., type, domain)
}

interface SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  showSearchHistory?: boolean;
  showOptionsMenu?: boolean;
  // Start with all properties from CheckboxListProps<OptionProps>,
  // except 'handleChange' and 'selectedOptions'
  optionMenuProps?: Omit<
    CheckboxListProps<OptionProps>,
    'handleChange' | 'selectedOptions'
  > & {
    // Optionally reintroduce 'handleChange' and 'selectedOptions' as  optional properties
    // since we create default values in <SearchBar/>, and we want to allow the user to override them.
    handleChange?: CheckboxListProps<OptionProps>['handleChange'];
    selectedOptions?: CheckboxListProps<OptionProps>['selectedOptions'];
  };
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
        showSearchHistory={props.showSearchHistory}
        showOptionsMenu={props.showOptionsMenu}
        {...props}
      />
    </InputWithDropdown>
  );
};
