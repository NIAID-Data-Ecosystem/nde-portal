import React from 'react';
import {
  Checkbox,
  Flex,
  Text,
  CheckboxProps,
  Skeleton,
} from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import Tooltip from 'src/components/tooltip';

export interface FiltersCheckboxProps extends CheckboxProps {
  displayTerm: string; // term used for display
  value: string; // unique checkbox value.
  count?: number;
  isLoading: boolean;
  property?: string;
  filterName: string;
  isCountUpdating?: boolean;
}

// Display the tooltip label for the filter term
const getTooltipLabel = (
  term: FiltersCheckboxProps['value'],
  filterName: FiltersCheckboxProps['filterName'],
) => {
  if (term === '-_exists_') {
    const name =
      filterName.charAt(0).toUpperCase() + filterName.slice(1).toLowerCase();
    return <>{name} not specified, missing, or unavailable.</>;
  } else if (term === '_exists_') {
    return (
      <>
        One or more {filterName.toLocaleLowerCase()} is specified, found, or
        available.
      </>
    );
  }
  return '';
};

export const FiltersCheckbox: React.FC<FiltersCheckboxProps> = React.memo(
  ({
    displayTerm,
    count,
    filterName,
    value,
    isCountUpdating,
    isLoading,
    property,
  }) => {
    return (
      <Checkbox
        w='100%'
        spacing={3}
        size='lg'
        value={value}
        my={2}
        sx={{ '.chakra-checkbox__label': { width: '100%' } }}
      >
        <Skeleton
          width='100%'
          h={isLoading ? 4 : 'unset'}
          isLoaded={!isLoading}
          flex={1}
        >
          <Flex width='100%' alignItems='center'>
            <Flex
              w='100%'
              justifyContent='space-between'
              alignItems='center'
              opacity={count ? 1 : 0.7}
              fontSize='xs'
              lineHeight={1.5}
            >
              {displayTerm && (
                <Tooltip label={getTooltipLabel(value, filterName)}>
                  <Text fontSize='xs' lineHeight={1.5} wordBreak='break-word'>
                    {(property === 'infectiousAgent' ||
                      property === 'species') &&
                    displayTerm?.includes('|') ? (
                      <>
                        {displayTerm
                          .split(' | ')
                          .reverse()
                          .map((term, i) => {
                            return (
                              <React.Fragment key={`${term}-${i}`}>
                                <Text
                                  as='span'
                                  fontWeight={i === 0 ? 'semibold' : 'normal'}
                                >
                                  {term.charAt(0).toUpperCase() + term.slice(1)}
                                </Text>
                                <br />
                              </React.Fragment>
                            );
                          })}
                      </>
                    ) : (
                      <>
                        {displayTerm.charAt(0).toUpperCase() +
                          displayTerm.slice(1)}
                      </>
                    )}
                  </Text>
                </Tooltip>
              )}

              {typeof count !== 'undefined' && (
                <Skeleton
                  as='span'
                  px={isCountUpdating ? 3 : 'unset'}
                  isLoaded={!isCountUpdating}
                  ml={1}
                >
                  <Text as='span' fontWeight='semibold'>
                    {count ? `${formatNumber(count)}` : '0 '}
                  </Text>
                </Skeleton>
              )}
            </Flex>
          </Flex>
        </Skeleton>
      </Checkbox>
    );
  },
);
