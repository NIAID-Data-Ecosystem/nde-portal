import React, { ReactElement, useMemo } from 'react';
import { groupBy, uniqBy } from 'lodash';
import {
  Box,
  Circle,
  Divider,
  Flex,
  Icon,
  InputProps,
  Text,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { usePredictiveSearchResponse } from '../hooks/usePredictiveSearch';
import {
  InputWithDropdown,
  DropdownInput,
  DropdownList,
  DropdownListItem,
  DropdownContent,
} from 'src/components/input-with-dropdown';
import { FaInfo } from 'react-icons/fa';

export interface SearchWithPredictiveTextProps
  extends usePredictiveSearchResponse {
  ariaLabel: string; // input label for accessibility
  placeholder: string; // input placeholder text
  field?: string; //default field to search through,
  term?: string; //default term to search with,
  size?: InputProps['size'];
  type?: InputProps['type'];
  hideSuggestions?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  colorScheme?: InputProps['colorScheme'];
  inputValue?: string;
  onClose?: () => void; // triggered when input 'x' is pressed.
  onClick?: (
    inputValue: string,
    field: string,
    data?: Partial<FormattedResource>,
  ) => void; // triggered when suggestion item from list is clicked.
  onChange?: (arg: string) => void;
  handleSubmit: (
    inputValue: string,
    field: string,
    data?: Partial<FormattedResource>,
  ) => void; // triggered when suggestion item from list is clicked / press enters.
  renderSubmitButton?: (props: any) => ReactElement; // an optional custom button rendered as the "submit" button.
}

// General search bar with predictive text. Groups results by type of resource.
export const PredictiveSearch: React.FC<SearchWithPredictiveTextProps> = ({
  ariaLabel,
  placeholder,
  size = 'sm',
  type = 'text',
  colorScheme = 'primary',
  hideSuggestions,
  handleSubmit,
  renderSubmitButton,
  onClose,
  onChange,
  onClick,
  isDisabled,
  isInvalid,
  isLoading,
  inputValue,
  ...props
}) => {
  // Search term entered in search bar
  const { results, searchField, searchTerm, updateSearchTerm } = props;
  const fieldName = searchField || 'name';
  // List of suggestions to search query.
  const uniqueSuggestions = useMemo(
    () =>
      uniqBy(
        results,
        // filter out duplicate values
        v => v[fieldName],
      ),
    [fieldName, results],
  );

  // Group suggestions by type.
  const suggestionsGroupedByType = useMemo(
    () => Object.entries(groupBy(uniqueSuggestions, d => d.type)),
    [uniqueSuggestions],
  );

  // Flat list of suggestions sorted by type.
  const suggestions = useMemo(
    () => suggestionsGroupedByType.map(d => d[1]).flat(),
    [suggestionsGroupedByType],
  );

  return (
    <Box width='100%'>
      {/* Keep dropdown agnostic from results. */}
      <InputWithDropdown
        inputValue={inputValue !== undefined ? inputValue : searchTerm}
        colorScheme={colorScheme}
        cursorMax={suggestions.length}
      >
        <DropdownInput
          id='predictive-search-input'
          isDisabled={isDisabled}
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          size={size}
          type={type}
          isLoading={isLoading}
          isInvalid={isInvalid}
          onChange={onChange ? onChange : updateSearchTerm}
          onSubmit={(value, idx) => {
            handleSubmit(value, searchField, results[idx]);
          }}
          renderSubmitButton={
            renderSubmitButton
              ? props => {
                  return renderSubmitButton({
                    colorScheme,
                    ariaLabel,
                    size,
                    isDisabled: isLoading || !searchTerm || false,
                    ...props,
                  });

                  // return (
                  //   <Button
                  //     display='flex'
                  //     colorScheme={colorScheme}
                  //     aria-label={ariaLabel}
                  //     // isDisabled={isLoading || false}
                  //     size={size}
                  //     {...props}
                  //   >
                  //     Search
                  //   </Button>
                  // );
                }
              : undefined
          }
          getInputValue={(idx: number): string => {
            if (suggestions && suggestions[idx]) {
              return suggestions[idx][fieldName] || '';
            }
            return '';
          }}
          onClose={onClose}
        />
        {!hideSuggestions && (
          <DropdownContent>
            {/* if no suggestions are listed, remind users that sometimes data is missing from data sources. */}
            {!isLoading && !suggestions.length && searchField && searchTerm && (
              <Flex flexDirection='column' alignItems='center'>
                <Text fontStyle='italic' p={2} fontSize='xs'>
                  No results
                </Text>
                <Divider w='100%' mx={8} />
                <Flex p={4}>
                  <Circle
                    size='20px'
                    borderColor='gray.600'
                    borderWidth='1px'
                    color='gray.600'
                    mr={1}
                  >
                    <Icon as={FaInfo} boxSize={2} />
                  </Circle>
                  <Text fontSize='xs' lineHeight='shorter'>
                    The Discovery Portal attempts to standardize metadata that
                    is available, however the number of results are affected by
                    metadata missing at the source.
                  </Text>
                </Flex>
              </Flex>
            )}
            {/* Group results by type (dataset/computational tool) */}
            {suggestionsGroupedByType.map(([type]) => {
              return (
                <Flex key={type} id={`${type}-list`} flexWrap='wrap' my={1}>
                  {/* column displaying the type of result. */}
                  {fieldName === 'name' && (
                    <Flex
                      flex={1}
                      justifyContent={['center', 'flex-end']}
                      bg={
                        type.toLowerCase() === 'dataset'
                          ? 'status.info_lt'
                          : 'blackAlpha.50'
                      }
                      mx={2}
                      my={1}
                      borderRadius='base'
                      minW={150}
                      maxW={{ base: 'unset', md: 180 }}
                    >
                      <Text
                        fontSize='xs'
                        color='text.body'
                        p={2}
                        textAlign='right'
                      >
                        {type}
                      </Text>
                    </Flex>
                  )}

                  {/* column displaying the fielded result */}
                  <DropdownList flex={3}>
                    {suggestions.map((result, i) => {
                      if (!result[fieldName]) {
                        return <React.Fragment key={i} />;
                      }
                      const value: any = result[fieldName];
                      return (
                        <DropdownListItem
                          key={value}
                          index={i}
                          searchTerm={
                            inputValue !== undefined ? inputValue : searchTerm
                          }
                          value={value}
                          name={fieldName}
                          onClick={e => {
                            onClick
                              ? onClick(value, searchField, result)
                              : handleSubmit(value, searchField, result);
                          }}
                        />
                      );
                    })}
                  </DropdownList>
                </Flex>
              );
            })}
          </DropdownContent>
        )}
      </InputWithDropdown>
    </Box>
  );
};
