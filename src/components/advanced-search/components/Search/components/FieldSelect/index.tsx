import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
  VisuallyHidden,
} from '@chakra-ui/react';
import { theme } from 'src/theme';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import Select, { components, OptionProps, ControlProps } from 'react-select';
import {
  FaFont,
  FaHashtag,
  FaRegCalendarDays,
  FaRegCircleCheck,
  FaMagnifyingGlass,
  FaListUl,
} from 'react-icons/fa6';
import { formatNumber } from 'src/utils/helpers';
import Fuse from 'fuse.js';
import { QueryValue } from 'src/components/advanced-search/types';
import { SchemaDefinition } from 'scripts/generate-schema-definitions/types';
import ADVANCED_SEARCH from 'configs/advanced-search-fields.json';

/****
 * Overlapping or unnecessary fields.
 * Based On:
 * https://docs.google.com/spreadsheets/d/1YoCzJ85px-wuOEgOvz-XlVICIqataBwimLuUE4-eV2s/edit#gid=291523994
 */

// Minimum amount of records a field must have to be included in field select.
const MIN_FIELD_RECORDS = 1;
// Filter out fields we want to remove from field select.
export const filterFields = (field: SchemaDefinition) => {
  return (
    field.type !== 'object' &&
    field.count >= MIN_FIELD_RECORDS &&
    !!ADVANCED_SEARCH.fields.includes(field.dotfield)
  );
};

const Option = (props: OptionProps<any>) => {
  const { isOpen: showDescription, onClose, onOpen } = useDisclosure();
  const { data } = props;
  const { label, type, count, property } = data;

  const { icon, tooltipLabel } = useMemo(() => {
    let icon;
    let tooltipLabel = type;
    if (type === 'text' || type === 'keyword') {
      icon = FaFont;
      if (data.enum) {
        icon = FaListUl;
      }
    } else if (type === 'date') {
      icon = FaRegCalendarDays;
    } else if (
      type === 'unsigned_long' ||
      type === 'integer' ||
      type === 'double' ||
      type === 'float'
    ) {
      icon = FaHashtag;
      tooltipLabel = 'number';
    } else if (type === 'boolean') {
      icon = FaRegCircleCheck;
    }

    return { icon, tooltipLabel };
  }, [type, data.enum]);

  // Description is the abstract or description field from the metadata fields config.
  const field_details = SCHEMA_DEFINITIONS?.[
    property as keyof typeof SCHEMA_DEFINITIONS
  ] as SchemaDefinition;

  let description = useMemo(() => {
    const abstract = field_details?.['abstract']
      ? Object.values(field_details['abstract'])[0]
      : '';
    const description = field_details?.['description']
      ? Object.values(field_details['description'])[0]
      : '';
    return abstract || description || '';
  }, [field_details]);

  return (
    <components.Option {...props}>
      <Box
        key={label}
        onMouseOver={onOpen}
        onMouseLeave={onClose}
        cursor='pointer'
      >
        <Flex
          alignItems='center'
          color={
            props.isFocused && !props.isSelected
              ? 'primary.600'
              : props.isSelected
              ? 'white'
              : 'text.body'
          }
        >
          <Tooltip
            hasArrow
            label={tooltipLabel.charAt(0).toUpperCase() + tooltipLabel.slice(1)}
            placement='top-start'
          >
            {/* icon displaying the type of field. */}
            <Box
              as='span'
              mt={label === 'All Fields' ? 0 : -1}
              alignSelf='flex-start'
            >
              {icon && <Icon as={icon} mr={2} boxSize={4} />}
            </Box>
          </Tooltip>

          {/* Name of field. */}
          <Box>
            <Text fontWeight='medium' color='inherit' lineHeight='none'>
              {label}
            </Text>
            {/* don't show count for items with no property (ex. "all fields") */}
            {data.property && count && (
              <Text
                as='span'
                fontStyle='italic'
                fontSize='xs'
                fontWeight='light'
                color='inherit'
              >
                {formatNumber(count)} records
              </Text>
            )}
            {description && (
              <Text
                fontSize='xs'
                lineHeight='shorter'
                fontWeight='normal'
                color={props.isSelected ? 'inherit' : 'gray.600'}
                transition='0.2s linear'
                maxW={350}
                noOfLines={!showDescription ? 1 : undefined}
              >
                {description.charAt(0).toUpperCase() +
                  description.toLowerCase().slice(1)}
                {description.charAt(description.length - 1) === '.' ? '' : '.'}
              </Text>
            )}
          </Box>
        </Flex>
      </Box>
    </components.Option>
  );
};

const Control = (props: ControlProps<any>) => {
  return (
    <components.Control {...props}>
      <Icon as={FaMagnifyingGlass} ml={2} color='gray.300' />
      {props.children}
    </components.Control>
  );
};

interface FieldSelectProps {
  isDisabled?: boolean;
  selectedField?: QueryValue['field'];
  setSelectedField: (field: QueryValue['field']) => void;
  defaultMenuIsOpen?: boolean;
  fields: SchemaDefinition[];
  size?: 'sm' | 'md' | 'lg';
}

export const customStyles: any = {
  sm: {
    control: {
      background: '#fff',
      borderColor: '#9e9e9e',
      minHeight: '30px',
      height: '30px',
    },
    valueContainer: {
      height: '30px',
      padding: '0 6px',
    },
    singleValue: { height: '100%' },
    input: {
      margin: '0px',
      height: '30px',
    },
    indicatorSeparator: {
      display: 'none',
    },
    indicatorsContainer: {
      height: '30px',
    },
  },
  md: {},
};

export const FieldSelect: React.FC<FieldSelectProps> = ({
  size = 'md',
  isDisabled = false,
  selectedField,
  setSelectedField,
  defaultMenuIsOpen = false,
  fields: allFields,
}) => {
  const [inputValue, setInputValue] = useState('');
  const fields = useMemo(
    () =>
      allFields
        .filter(filterFields)
        .map(field => {
          return {
            ...field,
            label: field.name,
            value: field.dotfield,
            property: field.dotfield,
          };
        })
        .sort((a, b) => {
          if (!inputValue) {
            return b.count - a.count;
          }
          return a.label.localeCompare(b.label);
        }),
    [allFields, inputValue],
  );

  const fuse = new Fuse(fields, { keys: ['label'] });
  const fuzzy_fields = fuse.search(inputValue).map(({ item }) => item);

  return (
    <Box minW='300px' w={{ base: '100%', md: 'unset' }} ml={0} mr={2}>
      {fields ? (
        <>
          <VisuallyHidden>
            <Text id='field-select-label' fontWeight='medium' color='gray.600'>
              Select field
            </Text>
          </VisuallyHidden>
          <Select
            aria-labelledby='field-select-label'
            instanceId='field-select'
            components={{ Control, Option }}
            value={
              selectedField
                ? fields.filter(
                    field =>
                      field?.property === selectedField ||
                      field?.label === selectedField,
                  )[0]
                : fields[0]
            }
            isDisabled={isDisabled}
            defaultMenuIsOpen={defaultMenuIsOpen}
            // is clearable when not the default "all fields" selection.
            isClearable={selectedField !== ''}
            isSearchable={true}
            placeholder='All Fields'
            name='Field'
            options={inputValue ? fuzzy_fields : fields}
            onChange={(option: any) =>
              setSelectedField(!option ? '' : option.value)
            }
            inputValue={inputValue}
            onInputChange={setInputValue}
            getOptionValue={option => `${option['label']}`}
            styles={{
              valueContainer: base => ({
                ...base,
                ...customStyles[size]?.valueContainer,
              }),

              singleValue: base => ({
                ...base,
                ...customStyles[size]?.singleValue,
              }),
              input: base => ({
                ...base,
                ...customStyles[size]?.input,
              }),
              indicatorSeparator: base => ({
                ...base,
                ...customStyles[size]?.indicatorSeparator,
              }),
              indicatorsContainer: base => ({
                ...base,
                ...customStyles[size]?.indicatorsContainer,
              }),
              control: base => {
                return {
                  ...base,
                  borderColor: theme.colors.gray[200],
                  boxShadow: 'none',
                  ':hover': {
                    borderColor: theme.colors.gray[200],
                  },
                  ':focus': {
                    borderColor: theme.colors.primary[500],
                    boxShadow: `0 0 0 1px ${theme.colors.primary[600]}`,
                  },
                  ':focus-within': {
                    borderColor: theme.colors.primary[500],
                    boxShadow: `0 0 0 1px ${theme.colors.primary[600]}`,
                  },
                  ...customStyles[size]?.control,
                };
              },

              option: (base, { isFocused, isSelected }) => {
                return {
                  ...base,
                  backgroundColor: isSelected
                    ? theme.colors.primary[500]
                    : isFocused
                    ? theme.colors.primary[100]
                    : 'transparent',
                  color: isSelected ? 'white' : theme.colors.text.body,
                  borderBottom: '1px solid',
                  borderBottomColor: theme.colors.primary[100],
                  ':hover': {
                    background: isSelected
                      ? theme.colors.primary[500]
                      : theme.colors.primary[100],
                  },

                  ...customStyles[size]?.option,
                };
              },
            }}
          />
        </>
      ) : (
        <></>
      )}
    </Box>
  );
};

export const FieldSelectWithContext = () => {
  const { queryValue, updateQueryValue } = useAdvancedSearchContext();
  const schema = Object.values(SCHEMA_DEFINITIONS).filter(
    item => !!item.isAdvancedSearchField,
  );
  const fields = [
    {
      name: 'All Fields',
      property: '',
      dotfield: '',
      count: SCHEMA_DEFINITIONS['@type']['count'],
      type: 'text',
    },
    ...Object.values(schema).filter(item => !!item.isAdvancedSearchField),
  ] as SchemaDefinition[];
  return (
    <FieldSelect
      selectedField={queryValue.field}
      setSelectedField={field => updateQueryValue({ field })}
      fields={fields}
    />
  );
};
