import {
  Box,
  Combobox,
  createListCollection,
  Flex,
  HStack,
  Icon,
  InputGroup,
  Portal,
  Separator,
  Text,
  useCombobox,
  UseComboboxProps,
  UseComboboxReturn,
} from '@chakra-ui/react';
import ADVANCED_SEARCH from 'configs/advanced-search-fields.json';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import Fuse from 'fuse.js';
import React, { useMemo, useRef, useState } from 'react';
import {
  FaFont,
  FaHashtag,
  FaListUl,
  FaMagnifyingGlass,
  FaRegCalendarDays,
  FaRegCircleCheck,
} from 'react-icons/fa6';
import { SchemaDefinition } from 'scripts/generate-schema-definitions/types';
import { QueryValue } from 'src/components/advanced-search/types';
import { INPUT_HEIGHTS } from 'src/theme/recipes/input.recipe';
import {
  HIDDEN_SAMPLE_FIELDS,
  SHOULD_HIDE_SAMPLE_FIELDS,
} from 'src/utils/feature-flags';
import { formatNumber } from 'src/utils/helpers';

import Tooltip from '../../../../../tooltip';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';

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

type ComboboxSize = 'sm' | 'md' | 'lg';

/*
Combobox styles shared with ../SearchInput/components/EnumInput, which sits in
the same row and has to look the same.
*/
export const comboboxStyles = {
  /*
  Rest at the height of the "Search for resources" field beside it.
  DropdownInput's group is `--input-height` plus, top and bottom, a 1px border
  and the 2px (`my={0.5}`) margin around its end element.
  */
  root: (size: ComboboxSize): Combobox.RootProps['css'] => ({
    '--combobox-input-height': `calc({${INPUT_HEIGHTS[size]}} + 6px)`,
  }),
  // The `outline` variant's transparent field and focus outline, swapped for a
  // white field with a primary border and ring.
  input: (size: ComboboxSize): Combobox.InputProps => ({
    bg: 'white',
    color: 'text.heading',
    fontSize: 'md',
    borderColor: size === 'sm' ? '#9e9e9e' : 'gray.200',
    borderRadius: 'sm',
    focusVisibleRing: 'none',
    _focus: {
      borderColor: 'primary.500',
      boxShadow: '0 0 0 1px {colors.primary.600}',
    },
  }),
  content: { maxH: '300px', p: 0, py: 1, borderRadius: 'sm' },
  item: {
    px: 3,
    py: 2,
    borderRadius: 0,
    color: 'text.body',
    // Option text at the page's 16px; the content's `textStyle: sm` is 14px.
    fontSize: 'md',
    cursor: 'pointer',
    css: {
      // Selection wins over highlight, so a highlighted selected row stays filled.
      '&[data-highlighted]:not([data-state=checked])': { bg: 'primary.100' },
      '&[data-state=checked]': { bg: 'primary.500', color: 'white' },
    },
  } satisfies Partial<Combobox.ItemProps>,
  empty: { color: 'gray.500', textAlign: 'center' },
} as const;

/** Divider between the clear and open buttons, at the larger size only. */
export const IndicatorSeparator = ({ size }: { size: ComboboxSize }) =>
  size === 'sm' ? null : (
    <Separator orientation='vertical' h={5} borderColor='gray.300' />
  );

/*
A combobox whose input shows the selected option while closed. Opening the list
by click, trigger or arrow key empties the input so typing starts a new search;
callers keep the selection on show as the placeholder, and zag writes it back
when the list closes (on select, Escape, or leaving the field). Opening by
typing keeps what was typed.

Emptying it through zag is deterministic where selecting the text is not: the
open state's entry action refocuses the input and moves the caret to the end a
frame later, undoing a selection made in a click or focus handler.
*/
export const useSearchCombobox = <T,>(
  props: UseComboboxProps<T>,
): UseComboboxReturn<T> => {
  const comboboxRef = useRef<UseComboboxReturn<T>>();
  const combobox = useCombobox<T>({
    inputBehavior: 'autohighlight',
    openOnClick: true,
    ...props,
    onOpenChange: details => {
      if (details.open && details.reason !== 'input-change') {
        comboboxRef.current?.setInputValue('');
      }
      props.onOpenChange?.(details);
    },
  });
  comboboxRef.current = combobox;
  return combobox;
};

// Value for the "All Fields" option, whose dotfield is the empty string.
const ALL_FIELDS = '_all_fields_';

type FieldOption = SchemaDefinition & {
  label: string;
  value: string;
  property: string;
};

const getFieldTypeIcon = ({ type, enum: enumValues }: FieldOption) => {
  if (type === 'text' || type === 'keyword') {
    return { icon: enumValues ? <FaListUl /> : <FaFont />, label: type };
  } else if (type === 'date') {
    return { icon: <FaRegCalendarDays />, label: type };
  } else if (
    type === 'unsigned_long' ||
    type === 'integer' ||
    type === 'double' ||
    type === 'float'
  ) {
    return { icon: <FaHashtag />, label: 'number' };
  } else if (type === 'boolean') {
    return { icon: <FaRegCircleCheck />, label: type };
  }
  return { icon: undefined, label: type };
};

const FieldSelectOption = ({ item }: { item: FieldOption }) => {
  const { label, count, property } = item;
  const { icon, label: tooltipLabel } = getFieldTypeIcon(item);

  // Description is the abstract or description field from the metadata fields config.
  const description = useMemo(() => {
    const field_details = SCHEMA_DEFINITIONS?.[
      property as keyof typeof SCHEMA_DEFINITIONS
    ] as SchemaDefinition;
    const abstract = field_details?.['abstract']
      ? Object.values(field_details['abstract'])[0]
      : '';
    const description = field_details?.['description']
      ? Object.values(field_details['description'])[0]
      : '';
    return abstract || description || '';
  }, [property]);

  return (
    <Combobox.Item
      item={item}
      {...comboboxStyles.item}
      justifyContent='flex-start'
      borderBottom='1px solid'
      borderBottomColor='primary.100'
      css={[
        comboboxStyles.item.css,
        {
          '&[data-highlighted]:not([data-state=checked])': {
            color: 'primary.600',
          },
          // Clamped to one line until highlighted, by pointer or keyboard.
          '&[data-highlighted] [data-description]': {
            WebkitLineClamp: 'unset',
          },
          '&[data-state=checked] [data-description]': { color: 'inherit' },
        },
      ]}
    >
      <HStack alignItems='flex-start' color='inherit' gap={3}>
        <Tooltip
          content={tooltipLabel.charAt(0).toUpperCase() + tooltipLabel.slice(1)}
          positioning={{ placement: 'top-start' }}
        >
          {icon && (
            <Icon boxSize={3} m={0.5} mt={1}>
              {icon}
            </Icon>
          )}
        </Tooltip>

        {/* Name of field. */}
        <Box>
          {/* A span by default; block keeps the count on the next line. */}
          <Combobox.ItemText
            display='block'
            fontWeight='medium'
            color='inherit'
            lineHeight='none'
          >
            {label}
          </Combobox.ItemText>
          {/* don't show count for items with no property (ex. "all fields") */}
          {property && count && (
            <Text
              as='span'
              fontStyle='italic'
              fontSize='sm'
              fontWeight='light'
              color='inherit'
            >
              {formatNumber(count)} records
            </Text>
          )}
          {description && (
            <Text
              data-description
              fontSize='sm'
              lineHeight='shorter'
              fontWeight='normal'
              color='gray.800'
              maxW={350}
              lineClamp={1}
            >
              {description.charAt(0).toUpperCase() +
                description.toLowerCase().slice(1)}
              {description.charAt(description.length - 1) === '.' ? '' : '.'}
            </Text>
          )}
        </Box>
      </HStack>
    </Combobox.Item>
  );
};

interface FieldSelectProps {
  disabled?: boolean;
  selectedField?: QueryValue['field'];
  setSelectedField: (field: QueryValue['field']) => void;
  defaultMenuIsOpen?: boolean;
  fields: SchemaDefinition[];
  size?: ComboboxSize;
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  size = 'md',
  disabled = false,
  selectedField,
  setSelectedField,
  defaultMenuIsOpen = false,
  fields: allFields,
}) => {
  const options = useMemo(
    () =>
      allFields.filter(filterFields).map(
        (field): FieldOption => ({
          ...field,
          label: field.name,
          value: field.dotfield || ALL_FIELDS,
          property: field.dotfield,
        }),
      ),
    [allFields],
  );

  // Before anything is typed, the fields with the most records come first.
  const optionsByCount = useMemo(
    () => [...options].sort((a, b) => b.count - a.count),
    [options],
  );
  // Typing ranks fuzzy matches by score; alphabetical order breaks ties.
  const fuse = useMemo(
    () =>
      new Fuse(
        [...options].sort((a, b) => a.label.localeCompare(b.label)),
        { keys: ['label'] },
      ),
    [options],
  );

  /*
  What has been typed, tracked only to filter the options. As in PageCombobox,
  the input's own text is left to zag, which reverts it to the selected field
  on close.
  */
  const [query, setQuery] = useState('');

  const collection = useMemo(
    () =>
      createListCollection({
        items: query
          ? fuse.search(query).map(({ item }) => item)
          : optionsByCount,
      }),
    [fuse, optionsByCount, query],
  );

  const selectedOption = selectedField
    ? options.find(
        field =>
          field.property === selectedField || field.label === selectedField,
      )
    : options.find(field => field.value === ALL_FIELDS);

  // "All Fields" (an empty field) is the default, so there is nothing to clear.
  const clearable = !!selectedField;

  const combobox = useSearchCombobox({
    /*
    Opt out of the enclosing Field.Root in ../../index.tsx, which belongs to
    the term input beside this one. Ark otherwise gives the combobox that
    field's control id (so two inputs share an id and both labels point at the
    first) and its invalid state, which is about the term.
    */
    ids: {},
    invalid: false,
    collection,
    value: selectedOption ? [selectedOption.value] : [],
    onValueChange: ({ value: [value] }) =>
      setSelectedField(
        !value || value === ALL_FIELDS ? '' : (value as QueryValue['field']),
      ),
    onInputValueChange: ({ inputValue, reason }) =>
      // Only the user's own typing filters; zag's rewrites reset the list.
      setQuery(reason === 'input-change' ? inputValue : ''),
    disabled,
    defaultOpen: defaultMenuIsOpen,
  });

  return (
    <Box minW='300px' w={{ base: '100%', md: 'unset' }} ml={0} mr={2}>
      <Combobox.RootProvider
        value={combobox}
        size={size}
        css={comboboxStyles.root(size)}
      >
        <Combobox.Label srOnly>Select field</Combobox.Label>
        <Combobox.Control>
          <InputGroup
            startElement={
              <Icon color='gray.300'>
                <FaMagnifyingGlass />
              </Icon>
            }
          >
            <Combobox.Input
              placeholder={selectedOption?.label ?? 'All Fields'}
              {...comboboxStyles.input(size)}
              // Focus by keyboard selects the text, so typing replaces it.
              onFocus={e => e.currentTarget.select()}
            />
          </InputGroup>
          <Combobox.IndicatorGroup>
            {clearable && <Combobox.ClearTrigger />}
            <IndicatorSeparator size={size} />
            <Combobox.Trigger color='gray.400' />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        {/* Portalled so the query builder's tree items cannot clip it. */}
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content {...comboboxStyles.content}>
              <Combobox.Empty {...comboboxStyles.empty}>
                No options
              </Combobox.Empty>
              {collection.items.map(item => (
                <FieldSelectOption key={item.value} item={item} />
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.RootProvider>
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
    // Filter out sample-related fields in production until the dataset sample section
    // is approved for release. The gated dotfields are hardcoded in
    // HIDDEN_SAMPLE_FIELDS.
    ...Object.values(schema).filter(
      item =>
        !!item.isAdvancedSearchField &&
        !(SHOULD_HIDE_SAMPLE_FIELDS && HIDDEN_SAMPLE_FIELDS.has(item.dotfield)),
    ),
  ] as SchemaDefinition[];

  return (
    <FieldSelect
      selectedField={queryValue.field}
      setSelectedField={field => updateQueryValue({ field })}
      fields={fields}
    />
  );
};
