import {
  Combobox,
  createListCollection,
  Flex,
  Portal,
  useFilter,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import {
  comboboxStyles,
  IndicatorSeparator,
  useSearchCombobox,
} from '../../FieldSelect';
import { AdvancedSearchInputProps } from '../types';

interface EnumInputProps extends AdvancedSearchInputProps {
  options?: {
    label: string;
    value: string;
  }[];
}

export const EnumInput: React.FC<EnumInputProps> = ({
  disabled,
  options = [],
  inputValue,
  size,
  handleChange,
  handleSubmit,
  renderSubmitButton,
}) => {
  const defaultOption =
    (inputValue && options.find(option => option.value === inputValue)) ||
    options[0];
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(defaultOption);

  useEffect(() => {
    handleChange({
      value: selectedOption?.value || '',
      term: selectedOption?.label || '',
      querystring: selectedOption?.value || '',
    });
  }, [handleChange, selectedOption]);

  // What has been typed, tracked only to filter the options (see FieldSelect).
  const [query, setQuery] = useState('');
  const { contains } = useFilter({ sensitivity: 'base' });

  const collection = useMemo(
    () =>
      createListCollection({
        items: query
          ? options.filter(option => contains(option.label, query))
          : options,
      }),
    [contains, options, query],
  );

  const combobox = useSearchCombobox({
    collection,
    value: selectedOption ? [selectedOption.value] : [],
    onValueChange: ({ items: [item] }) => item && setSelectedOption(item),
    onInputValueChange: ({ inputValue, reason }) =>
      setQuery(reason === 'input-change' ? inputValue : ''),
    disabled,
  });

  return (
    <Flex w='100%' alignItems='center' asChild>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit({
            term: selectedOption?.label || '',
            querystring: selectedOption?.value || '',
          });
          setSelectedOption(defaultOption);
        }}
      >
        <Combobox.RootProvider
          value={combobox}
          flex={1}
          size={size}
          css={comboboxStyles.root(size)}
        >
          <Combobox.Label srOnly>Select value</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input
              placeholder={selectedOption?.label}
              {...comboboxStyles.input(size)}
              fontWeight='medium'
              // Focus by keyboard selects the text, so typing replaces it.
              onFocus={e => e.currentTarget.select()}
            />
            <Combobox.IndicatorGroup>
              <IndicatorSeparator size={size} />
              <Combobox.Trigger color='gray.400' />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content {...comboboxStyles.content}>
                <Combobox.Empty {...comboboxStyles.empty}>
                  No options
                </Combobox.Empty>
                {collection.items.map(item => (
                  <Combobox.Item
                    key={item.value}
                    item={item}
                    {...comboboxStyles.item}
                  >
                    <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  </Combobox.Item>
                ))}
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.RootProvider>
        <Flex mx={2}>
          {renderSubmitButton &&
            renderSubmitButton({
              type: 'submit',
              w: '100%',
              disabled: false,
            })}
        </Flex>
      </form>
    </Flex>
  );
};
