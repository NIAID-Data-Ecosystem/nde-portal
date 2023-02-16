import { uniqueId } from 'lodash';
import { Flex } from 'nde-design-system';
import { useEffect } from 'react';
import { TreeItem } from '../SortableWithCombine';
import {
  AdvancedSearchFormContext,
  useAdvancedSearchContext,
} from './components/AdvancedSearchFormContext';
import { Disclaimer } from './components/Disclaimer';
import { SearchInput } from './components/SearchInput';
import { SearchOptions } from './components/SearchOptions';
import { SEARCH_TYPES_CONFIG } from './search-types-config';

interface SearchProps {
  items: TreeItem[];
  setItems: React.Dispatch<React.SetStateAction<TreeItem[]>>;
  resetForm: boolean;
  setResetForm: (arg: boolean) => void;
}
export const Search = ({
  items,
  setItems,
  resetForm,
  setResetForm,
}: SearchProps) => {
  const { onReset } = useAdvancedSearchContext();

  // if form is reset, we reset the selected field, search type and input value
  useEffect(() => {
    if (resetForm) {
      onReset();
    }
    return () => {
      setResetForm(false);
    };
  }, [onReset, resetForm, setResetForm]);

  return (
    <>
      <Flex w='100%' justifyContent='flex-end'>
        <SearchOptions />
      </Flex>
      <Flex w='100%' alignItems='flex-end'>
        <SearchInput
          size='md'
          colorScheme='primary'
          items={items}
          resetForm={resetForm}
          setResetForm={setResetForm}
          onSubmit={({ term, field, union, querystring }) => {
            setItems(() => {
              if (!term) return items;
              const newItems = [...items];
              const id = `${uniqueId(
                `${term.slice(0, 20).split(' ').join('-')}-${items.length}-`,
              )}`;

              newItems.push({
                id,
                parentId: null,
                depth: 0,
                value: {
                  field,
                  term,
                  union,
                  querystring,
                },
                children: [],
                index: items.length,
              });

              return newItems;
            });
          }}
        />
      </Flex>
      <Disclaimer />
    </>
  );
};

export * from './components/AdvancedSearchFormContext';
export * from './components/FieldSelect';
export * from './components/SearchInput';
