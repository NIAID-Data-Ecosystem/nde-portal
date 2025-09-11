import React, { useEffect, useMemo, useState } from 'react';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { uniq } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, Flex, HStack, IconButton, List, Text } from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import {
  DropdownInput,
  DropdownInputProps,
  InputWithDropdown,
  useDropdownContext,
} from '../input-with-dropdown';
import { SearchHistoryItem } from './components/search-history-item';
import { CheckboxList, CheckboxListProps } from '../checkbox-list';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';
import { Tooltip } from '../ui/tooltip';

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
  const { colorPalette, isOpen, setIsOpen } = useDropdownContext();
  return (
    <DropdownInput
      {...inputProps}
      onClose={() => {
        setIsOpen(false);
      }}
      renderSubmitButton={props => (
        <HStack height='100%'>
          {showOptionsMenu && optionMenuProps && (
            <CheckboxList
              {...optionMenuProps}
              colorPalette={colorPalette}
            ></CheckboxList>
          )}
          <Button
            {...props}
            colorPalette={colorPalette}
            type='submit'
            display={{ base: 'none', md: 'flex' }}
            aria-label={inputProps.ariaLabel}
          >
            Submit
          </Button>
          {showSearchHistory && (
            <Flex borderLeft='1px solid' borderLeftColor='gray.200' pl={1}>
              <Tooltip content='Toggle search history'>
                <IconButton
                  variant='ghost'
                  size={inputProps.size}
                  aria-label='Toggle search history.'
                  onClick={() => setIsOpen(!isOpen)}
                  colorPalette={colorPalette}
                >
                  <FaClockRotateLeft />
                </IconButton>
              </Tooltip>
            </Flex>
          )}
        </HStack>
      )}
    />
  );
};

interface SearchBarProps extends SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  searchHistory?: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchBar = ({
  ariaLabel,
  placeholder,
  colorPalette = 'primary',
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

    const trimmedTerm = term.trim();
    const filters = queryFilters
      .filter(item => item.property === '@type')
      ?.map(filter => filter.value);

    const tab = getTabIdFromTypeLabel(filters[0]);

    router.push({
      pathname: `/search`,
      query: {
        ...(trimmedTerm && { q: trimmedTerm }),
        ...(filters?.length && {
          filters: queryFilterObject2String({
            '@type': filters,
          }),
        }),
        ...(tab && { tab }),
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
          <List.Root as='ul' ml={0}>
            <List.Item
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
                color={`${colorPalette}.600`}
                fontWeight='medium'
              >
                {historyList.length
                  ? 'Previous searches'
                  : 'No previous searches.'}
              </Text>
            </List.Item>
            {historyList.map((str, index) => {
              return (
                <SearchHistoryItem
                  key={str}
                  index={index}
                  colorPalette={colorPalette}
                  searchTerm={searchTerm}
                  value={str}
                  onClick={value => handleSubmit(value)}
                />
              );
            })}
          </List.Root>
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
  colorPalette?: DropdownInputProps['colorPalette'];
  size?: DropdownInputProps['size'];
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
      colorPalette={props.colorPalette}
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
