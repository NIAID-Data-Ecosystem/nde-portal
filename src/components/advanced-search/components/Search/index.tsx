import { uniqueId } from 'lodash';
import { Flex } from 'nde-design-system';
import { useEffect } from 'react';
import { TreeItem } from '../SortableWithCombine';
import { useAdvancedSearchContext } from './components/AdvancedSearchFormContext';
import { Disclaimer } from './components/Disclaimer';
import { SearchInput } from './components/SearchInput';
import { SearchOptions } from './components/SearchOptions';

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
          onSubmit={queryValue => {
            setItems(prev => {
              const queryItem = Array.isArray(queryValue)
                ? queryValue
                : [queryValue];

              const newItems = [...prev];

              queryItem.map((item, i) => {
                const { field, term, union, querystring } = item;

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
                    union: union || undefined,
                    querystring,
                  },
                  children: [],
                  index: items.length + i,
                });
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
