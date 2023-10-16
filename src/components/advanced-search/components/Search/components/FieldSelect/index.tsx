import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
  VisuallyHidden,
} from 'nde-design-system';
import { theme } from 'src/theme';
import MetadataFields from 'configs/resource-fields.json';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import Select, { components, OptionProps, ControlProps } from 'react-select';
import {
  FaHashtag,
  FaRegCalendarAlt,
  FaRegCheckCircle,
  FaSearch,
  FaTh,
} from 'react-icons/fa';
import { MdTextFormat } from 'react-icons/md';
import { formatNumber } from 'src/utils/helpers';
import { filterFields, transformFieldName } from './helpers';
import Fuse from 'fuse.js';
import { QueryValue } from 'src/components/advanced-search/types';

const Option = (props: OptionProps<any>) => {
  const { isOpen: showDescription, onClose, onOpen } = useDisclosure();
  const { data } = props;
  const { label, type, count } = data;
  const ref = useRef(null);

  const { icon, tooltipLabel } = useMemo(() => {
    let icon;
    let tooltipLabel = type;
    if (type === 'text' || type === 'keyword') {
      icon = MdTextFormat;
      if (data.enum) {
        icon = FaTh;
      }
    } else if (type === 'date') {
      icon = FaRegCalendarAlt;
    } else if (
      type === 'unsigned_long' ||
      type === 'integer' ||
      type === 'double' ||
      type === 'float'
    ) {
      icon = FaHashtag;
      tooltipLabel = 'number';
    } else if (type === 'boolean') {
      icon = FaRegCheckCircle;
    }

    return { icon, tooltipLabel };
  }, [type, data.enum]);

  // Description is the abstract or description field from the metadata fields config.
  let description = useMemo(() => {
    const metaDescription = data.abstract ? data.abstract : data.description;
    if (typeof metaDescription === 'object') {
      return Object.values(metaDescription)
        .filter(
          (str, idx) => Object.values(metaDescription).indexOf(str) === idx,
        )
        .join(' or ');
    }
    return metaDescription;
  }, [data.abstract, data.description]);
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
              ref={ref}
              _hover={{
                svg: { color: props.isFocused ? 'primary.600' : 'gray.800' },
              }}
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
          </Box>
        </Flex>

        {showDescription && description && (
          <Text
            fontSize='xs'
            lineHeight='shorter'
            fontWeight='medium'
            color={props.isSelected ? 'inherit' : 'gray.600'}
            transition='0.2s linear'
            maxW={350}
          >
            {description.charAt(0).toUpperCase() +
              description.toLowerCase().slice(1)}
            {description.charAt(description.length - 1) === '.' ? '' : '.'}
          </Text>
        )}
      </Box>
    </components.Option>
  );
};

const Control = (props: ControlProps<any>) => {
  return (
    <components.Control {...props}>
      <Icon as={FaSearch} ml={2} color='gray.300' />
      {props.children}
    </components.Control>
  );
};

interface FieldSelectProps {
  isDisabled?: boolean;
  selectedField: QueryValue['field'];
  setSelectedField: (field: QueryValue['field']) => void;
  defaultMenuIsOpen?: boolean;
  fields: typeof MetadataFields;
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
            label: transformFieldName(field),
            value: field.property,
            property: field.property,
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
            <Text fontWeight='medium' color='gray.600'>
              Select field
            </Text>
          </VisuallyHidden>
          <Select
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

  return (
    <FieldSelect
      selectedField={queryValue.field}
      setSelectedField={field => updateQueryValue({ field })}
      fields={MetadataFields}
    />
  );
};
