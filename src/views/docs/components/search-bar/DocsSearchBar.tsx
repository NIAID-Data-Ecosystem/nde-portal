import { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { InputWithDropdown } from 'src/components/input-with-dropdown';
import { useLocalStorage } from 'usehooks-ts';
import { SearchBar } from './SearchBar';
import { DocsSearchBarProps } from './types';

export const DocsSearchBar = (props: DocsSearchBarProps) => {
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>(
    'docs-searches',
    [],
  );
  const [mounted, setMounted] = useState(false);
  const [currentCursorMax, setCurrentCursorMax] = useState(0);

  useEffect(() => {
    setMounted(true);
    setCurrentCursorMax(searchHistory.length);
  }, [searchHistory.length]);

  if (!mounted) {
    return null;
  }

  return (
    <Flex w='100%' justifyContent='center' px={4}>
      <Box w='100%' maxW='1200px'>
        <InputWithDropdown
          inputValue=''
          cursorMax={currentCursorMax}
          colorScheme={props.colorScheme}
        >
          <SearchBar
            searchHistory={searchHistory}
            setSearchHistory={setSearchHistory}
            currentCursorMax={currentCursorMax}
            setCurrentCursorMax={setCurrentCursorMax}
            {...props}
          />
        </InputWithDropdown>
      </Box>
    </Flex>
  );
};
