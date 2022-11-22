import React from 'react';
import { useQuery } from 'react-query';
import { Select, Skeleton } from 'nde-design-system';
import { fetchFields, FetchFieldsResponse } from 'src/utils/api';

interface SelectFieldProps {
  isDisabled: boolean;
  searchField: string;
  setSearchField: React.Dispatch<React.SetStateAction<string>>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  searchField,
  setSearchField,
  isDisabled,
}) => {
  // Retrieve fields for select dropdown.
  const { isLoading, data: fields } = useQuery<
    FetchFieldsResponse[] | undefined,
    Error
  >(
    ['metadata-fields'],
    () => {
      return fetchFields();
    },
    {
      refetchOnWindowFocus: false,
      enabled: !isDisabled, // Run query if not disabled
    },
  );

  return (
    <Skeleton
      minW='150px'
      w={{ base: '100%', md: 'unset' }}
      ml={0}
      isLoaded={!isLoading}
    >
      <Select
        size='lg'
        placeholder='All Fields'
        variant='filled'
        value={searchField}
        onChange={e => {
          const { value } = e.currentTarget;
          setSearchField(value);
        }}
      >
        {fields?.map(field => {
          return (
            <option key={field.property} value={field.property}>
              {field.property}
            </option>
          );
        })}
      </Select>
    </Skeleton>
  );
};
