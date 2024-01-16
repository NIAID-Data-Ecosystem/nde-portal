import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Tag, TagLabel, Text } from '@chakra-ui/react';
import {
  getFieldDetails,
  getSearchOptionsForField,
  getSearchType,
} from '../helpers';
import { SearchTypesConfigProps } from 'src/components/advanced-search/components/Search/search-types-config';
import { Value } from '../../../types';
import { transformFieldName } from 'src/components/advanced-search/components/Search/components/FieldSelect/helpers';
import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';

interface TreeItemContentProps extends Value {
  childCount?: number;
  searchOptionsList: SearchTypesConfigProps[];
}

/**
 * [TreeItemContent]
 * Displays the content of a TreeItem such as term, search option type and field.
 */
export const TreeItemContent = React.memo((props: TreeItemContentProps) => {
  const { field, querystring, union, term, childCount, searchOptionsList } =
    props;

  // Search Options change depending on what field is selected.
  const searchOptions = useMemo(
    () =>
      getSearchOptionsForField(
        { field, querystring, union, term },
        searchOptionsList,
      ),
    [field, querystring, union, term, searchOptionsList],
  );

  // Get search type from querystring format.
  const searchType = useMemo(
    () => getSearchType({ field, querystring, union, term }, searchOptions),
    [field, querystring, union, term, searchOptions],
  );

  const fieldDetails = useMemo(
    () => field && term && getFieldDetails(field, term),
    [field, term],
  );

  const getDisplayTerm = useCallback(() => {
    if (field === '_exists_') {
      return (
        <Text as='span'>
          <Text as='span' fontWeight='bold'>{`${
            fieldDetails ? transformFieldName(fieldDetails) : field
          }`}</Text>{' '}
          exists
        </Text>
      );
    } else if (field === '-_exists_') {
      return (
        <Text as='span'>
          <Text as='span' fontWeight='bold'>{`${
            fieldDetails ? transformFieldName(fieldDetails) : field
          }`}</Text>{' '}
          {`doesn't
        exist`}
        </Text>
      );
    }
    return <Text as='span'>{term}</Text>;
  }, [field, term, fieldDetails]);

  return (
    <Flex flex={1} alignItems='center'>
      <Box flex={1}>
        {/* Label displaying search type (such as contains, exact, etc.) */}
        {!childCount && searchType && (
          <Text
            fontWeight='semibold'
            fontFamily='heading'
            fontSize='10px'
            textTransform='uppercase'
          >
            {searchType.label}
          </Text>
        )}

        {/* Formatted term for display */}
        <Text fontSize='sm' fontWeight='medium' noOfLines={2}>
          {childCount ? term : getDisplayTerm()}
        </Text>
      </Box>

      {field && (
        <Tag
          colorScheme={union ? getUnionTheme(union).colorScheme : 'gray'}
          variant='subtle'
          size='sm'
          mr={2}
        >
          <TagLabel>{fieldDetails ? fieldDetails.name : field}</TagLabel>
        </Tag>
      )}
    </Flex>
  );
});
