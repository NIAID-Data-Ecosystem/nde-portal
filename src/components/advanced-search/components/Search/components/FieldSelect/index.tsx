import React, { useRef } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  theme,
  Tooltip,
  useDisclosure,
  VisuallyHidden,
} from 'nde-design-system';
import MetadataConfig from 'configs/resource-metadata.json';
import MetadataFields from 'configs/resource-fields.json';
import { getMetadataNameByProperty } from 'src/components/advanced-search/utils';
import { getPropertyInConfig } from 'src/utils/metadata-schema';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import Select, { components, OptionProps, ControlProps } from 'react-select';
import { FaHashtag, FaRegCalendarAlt, FaSearch, FaTh } from 'react-icons/fa';
import { MdTextFormat } from 'react-icons/md';
import { formatNumber } from 'src/utils/helpers';

interface FieldSelectProps {
  isDisabled: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  size = 'md',
  isDisabled,
}) => {
  const { setSearchField } = useAdvancedSearchContext();

  // Retrieve fields for select dropdown.
  const fields = [
    {
      label: 'All Fields',
      description: '',
      value: '',
      type: '',
    },
    ...MetadataFields.map(field => {
      const fieldInformation = getPropertyInConfig(
        field.property,
        MetadataConfig,
      );
      const label =
        fieldInformation?.title || getMetadataNameByProperty(field.property);
      let description =
        fieldInformation?.abstract || fieldInformation?.description || '';
      if (typeof description === 'object') {
        description = Object.values(description).join(' or ');
      }
      return {
        ...fieldInformation,
        label,
        description,
        value: field.property,
        type: field.type,
        count: field.count,
      };
    }),
  ];

  const Control = (props: ControlProps<any>) => {
    return (
      <components.Control {...props}>
        <Icon as={FaSearch} ml={2} color='gray.300' />
        {props.children}
      </components.Control>
    );
  };

  const Option = (props: OptionProps<any>) => {
    const { isOpen: showDescription, onClose, onOpen } = useDisclosure();
    const { data } = props;
    const { label, description, type, count } = data;
    console.log(data);
    const ref = useRef(null);

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
    }

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
              label={
                tooltipLabel.charAt(0).toUpperCase() + tooltipLabel.slice(1)
              }
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
              {count && (
                <Text
                  as='span'
                  fontStyle='italic'
                  fontSize='xs'
                  fontWeight='light'
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
            </Text>
          )}
        </Box>
      </components.Option>
    );
  };

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
            components={{ Control, Option }}
            // defaultValue={fields[0]}
            isDisabled={isDisabled}
            isClearable
            isSearchable={true}
            placeholder='All Fields'
            name='Field'
            options={fields}
            onChange={(option: any) => {
              if (!option) {
                setSearchField('');
              } else {
                setSearchField(option.value);
              }
            }}
            styles={{
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
                };
              },
              option: (base, { isFocused, isSelected, ...eep }) => {
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
