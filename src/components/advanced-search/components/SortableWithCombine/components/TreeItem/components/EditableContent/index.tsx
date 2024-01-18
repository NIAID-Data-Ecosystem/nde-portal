import { Box, Button, Collapse, Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';
import {
  AdvancedSearchFormContext,
  useAdvancedSearchContext,
} from 'src/components/advanced-search/components/Search';
import { SearchTypesConfigProps } from 'src/components/advanced-search/components/Search/search-types-config';
import { UnionTypes } from 'src/components/advanced-search/types';
import {
  checkBalancedPunctuation,
  QueryStringError,
  removeDuplicateErrors,
} from 'src/components/advanced-search/utils/validation-checks';
import { FlattenedItem, Value } from '../../../../types';
import { getSearchType, stripSearchTerm } from '../../helpers';
import { FieldTag } from './Field';
import { SearchLabel } from './SearchLabel';
import { TermLabel } from './Term';

export interface ItemContentProps {
  id: FlattenedItem['id'];
  childCount?: number;
  setIsEditMode: (arg: boolean) => void;
  value: FlattenedItem['value'];
  onUpdate?(
    id: FlattenedItem['id'],
    updatedValue: Partial<FlattenedItem['value']>,
  ): void;
  searchOptions: SearchTypesConfigProps[];
}

const ItemContent = ({
  id,
  childCount,
  setIsEditMode,
  value,
  onUpdate,
  searchOptions,
}: ItemContentProps) => {
  const [errors, setErrors] = useState<QueryStringError[]>([]);
  const { queryValue, selectedSearchType, selectedFieldDetails, onReset } =
    useAdvancedSearchContext();

  const validateQueryString = (value: string) => {
    const errors = [] as QueryStringError[];
    if (
      selectedFieldDetails?.type !== 'text' &&
      selectedFieldDetails?.type !== 'keyword'
    ) {
      return errors;
    } else {
      const isBalanced = checkBalancedPunctuation(value);
      if (!isBalanced.isValid) {
        isBalanced.error && errors.push(isBalanced.error);
      }
      setErrors(() => removeDuplicateErrors([...errors]));
      return errors;
    }
  };

  return (
    <Flex flex={1} p={1} mx={2} flexDirection='column'>
      <Box flex={1}>
        {/* Search option */}
        {childCount === 0 && (
          <SearchLabel value={value} options={searchOptions} />
        )}

        <Flex
          alignItems='center'
          mt={1}
          flex={1}
          flexDirection={['column', 'column', 'row']}
        >
          <Box
            w='100%'
            flex={1}
            mr={[
              0,
              0,
              selectedFieldDetails?.type === 'keyword' ||
              selectedFieldDetails?.type === 'text'
                ? 4
                : 0,
            ]}
          >
            {/* Term string */}
            <TermLabel
              term={value.term}
              querystring={stripSearchTerm(value?.querystring || '')}
              errors={errors}
              handleValidation={validateQueryString}
            />
          </Box>

          {/* Field Select dropdown */}
          <FieldTag />
        </Flex>
      </Box>
      <Collapse in={errors.length > 0}>
        {errors.map(error => (
          <Text
            key={error.id}
            color='status.error'
            fontSize='xs'
            fontStyle='italic'
          >
            {error.message}
          </Text>
        ))}
      </Collapse>

      <Flex alignItems='center' justifyContent='flex-end' mt={2}>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            setIsEditMode(false);
            onReset();
          }}
          m={1}
        >
          Cancel
        </Button>
        <Button
          size='sm'
          m={1}
          isDisabled={
            !{
              ...value,
              ...queryValue,
            }.term || errors.length > 0
          }
          onClick={() => {
            let updatedQuery = {
              ...value,
              ...queryValue,
            };
            const errors = validateQueryString(updatedQuery.querystring);
            if (errors.length > 0) {
              return;
            }
            // transform the querystring according to the selected search type
            if (selectedSearchType && selectedSearchType.transformValue) {
              if (
                selectedFieldDetails?.type === 'text' ||
                selectedFieldDetails?.type === 'keyword'
              ) {
                // strip off any quotes or wildcards from the querystring that will interfere with transforming the value below.
                updatedQuery.querystring = stripSearchTerm(
                  updatedQuery.querystring,
                );
              }
              const transformed =
                selectedSearchType.transformValue(updatedQuery);
              onUpdate && onUpdate(id, { ...transformed });
            } else {
              onUpdate && onUpdate(id, updatedQuery);
            }
            setIsEditMode(false);
          }}
        >
          Submit
        </Button>
      </Flex>
    </Flex>
  );
};

interface EditableContentProps extends Value, Omit<ItemContentProps, 'value'> {
  searchOptions: SearchTypesConfigProps[];
}

export const EditableContent = (props: EditableContentProps) => {
  const { searchOptions } = props;
  const query = {
    field: props.field || '',
    union: props?.union || ('' as UnionTypes),
    term: stripSearchTerm(props?.term || ''),
    querystring: (props.querystring ? props.querystring : props.term) || '',
  };

  const searchType = getSearchType(query, searchOptions);

  return (
    <AdvancedSearchFormContext
      searchTypeOptions={searchOptions}
      value={query}
      defaultSearchType={searchType}
    >
      <ItemContent {...props} value={query} />
    </AdvancedSearchFormContext>
  );
};
