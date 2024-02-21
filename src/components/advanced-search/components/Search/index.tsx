import { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { QueryStringError } from '../../utils/validation-checks';
import { TreeItem } from '../SortableWithCombine';
import { useAdvancedSearchContext } from './components/AdvancedSearchFormContext';
import { Disclaimer } from './components/Disclaimer';
import { SearchInput } from './components/SearchInput';
import { SearchOptions } from './components/SearchOptions';
import { FieldSelectWithContext } from './components/FieldSelect';
import {
  InputSubmitButton,
  InputSubmitButtonProps,
} from './components/SearchInput/components';

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
  const [errors, setErrors] = useState<QueryStringError[]>([]);

  const { queryValue, onReset, selectedSearchType } =
    useAdvancedSearchContext();

  // if form is reset, we reset the selected field, search type and input value
  useEffect(() => {
    if (resetForm) {
      onReset();
      setErrors([]);
    }
    return () => {
      setResetForm(false);
    };
  }, [onReset, resetForm, setResetForm]);

  // clear errors when field is changed.
  useEffect(() => {
    setErrors([]);
  }, [queryValue.field]);

  return (
    <>
      <Flex
        w='100%'
        justifyContent={['flex-start', 'flex-start', 'flex-end']}
        my={[4, 2, 0]}
      >
        <SearchOptions />
      </Flex>

      <Flex w='100%' alignItems='flex-end'>
        <FormControl isInvalid={errors.length > 0}>
          <Flex
            flexDirection={['column', 'column', 'row']}
            alignItems='flex-end'
          >
            <Box
              maxW={['unset', 'unset', '300px']}
              flex={1}
              w='100%'
              position='relative'
              zIndex='popover'
              mb={[4, 2, 0]}
              mr={[0, 0, 4]}
            >
              <FieldSelectWithContext />
            </Box>
            <SearchInput
              size='md'
              colorScheme='primary'
              errors={errors}
              setErrors={setErrors}
              resetForm={resetForm}
              setResetForm={setResetForm}
              onSubmit={queryValue => {
                setItems(prev => {
                  const queryItem = Array.isArray(queryValue)
                    ? queryValue
                    : [queryValue];

                  const newItems = [...prev];

                  queryItem.map(item => {
                    const { field, term, union, querystring } = item;
                    const id = `${uniqueId(
                      `${term.slice(0, 20).split(' ').join('-')}-${
                        items.length
                      }-`,
                    )}`;

                    newItems.push({
                      id,
                      value: {
                        field,
                        term,
                        union: union || undefined,
                        querystring,
                      },
                      children: [],
                      collapsed: false,
                    });
                  });

                  return newItems;
                });
              }}
              defaultInputValue={''}
              renderSubmitButton={(props: Partial<InputSubmitButtonProps>) => (
                <InputSubmitButton
                  items={items}
                  size='md'
                  colorScheme='primary'
                  // Button is disabled when the text input is needed but empty.
                  isDisabled={
                    selectedSearchType.id !== '_exists_' &&
                    selectedSearchType.id !== '-_exists_'
                  }
                  {...props}
                />
              )}
            />
          </Flex>
          <FormErrorMessage justifyContent='flex-end'>
            <UnorderedList>
              {/* This is my error message */}
              {errors.map((error, index) => (
                <ListItem key={index}>
                  <Text color='inherit' lineHeight='shorter'>
                    <strong>{error.title}</strong>: {error.message}
                  </Text>
                </ListItem>
              ))}
            </UnorderedList>
          </FormErrorMessage>
        </FormControl>
      </Flex>
      <Disclaimer />
    </>
  );
};

export * from './components/AdvancedSearchFormContext';
export * from './components/FieldSelect';
export * from './components/SearchInput';
