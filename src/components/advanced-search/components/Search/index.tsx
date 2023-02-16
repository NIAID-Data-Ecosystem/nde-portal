import { uniqueId } from 'lodash';
import { Flex } from 'nde-design-system';
import { TreeItem } from '../SortableWithCombine';
import { AdvancedSearchFormContext } from './components/AdvancedSearchFormContext';
import { Disclaimer } from './components/Disclaimer';
import { FieldSelect, FieldSelectWithContext } from './components/FieldSelect';
import { SearchInput } from './components/SearchInput';
import { SearchOptions } from './components/SearchOptions';
import { SEARCH_TYPES_CONFIG } from './search-types-config';
// import { SearchOptions } from './components/SearchOptions';

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
  return (
    <AdvancedSearchFormContext searchTypeOptions={SEARCH_TYPES_CONFIG}>
      <Flex w='100%' justifyContent='flex-end'>
        <SearchOptions />
      </Flex>
      <Flex w='100%' alignItems='flex-end'>
        <FieldSelectWithContext />
        {/* <SearchInput
          size='md'
          colorScheme='primary'
          items={items}
          isFormReset={resetForm}
          setResetForm={setResetForm}
          onSubmit={({ term, field, union, querystring, searchType }) => {
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
                  searchType,
                },
                children: [],
                index: items.length,
              });

              return newItems;
            });
          }}
        /> */}
      </Flex>
      {/* <Disclaimer /> */}
    </AdvancedSearchFormContext>
  );
};

export * from './components/AdvancedSearchFormContext';
export * from './components/FieldSelect';
export * from './components/SearchInput';
