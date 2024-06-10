import React from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import { InputWithDropdown } from '../input-with-dropdown';
import { SearchBar } from './components/search-bar';
import { SearchBarWithOptions } from './components/search-bar-with-options';

export interface SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  options?: {
    name: string;
    value: string;
    count: number;
  }[];
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

  if (props?.options) {
    return (
      <InputWithDropdown
        inputValue={defaultInputValue}
        cursorMax={searchHistory.length}
        colorScheme={props.colorScheme}
      >
        <SearchBarWithOptions
          searchHistory={searchHistory}
          setSearchHistory={setSearchHistory}
          options={props.options}
          {...props}
        />
      </InputWithDropdown>
    );
  }

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
