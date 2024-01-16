import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Flex } from '@chakra-ui/react';
import { AdvancedSearchInputProps } from '../types';
import { customStyles } from '../../FieldSelect';
import { theme } from 'src/theme';

interface EnumInputProps extends AdvancedSearchInputProps {
  options?: {
    label: string;
    value: string;
  }[];
}

export const EnumInput: React.FC<EnumInputProps> = ({
  isDisabled,
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

  return (
    <Flex
      as='form'
      w='100%'
      alignItems='center'
      onSubmit={e => {
        e.preventDefault();
        handleSubmit({
          term: selectedOption?.label || '',
          querystring: selectedOption?.value || '',
        });
        setSelectedOption(defaultOption);
      }}
    >
      <Select
        defaultValue={defaultOption}
        isDisabled={isDisabled}
        isSearchable={true}
        name='Field options'
        value={selectedOption}
        options={options}
        onChange={(option: any) => {
          setSelectedOption(option);
        }}
        styles={{
          valueContainer: base => ({
            ...base,
            ...customStyles[size]?.valueContainer,
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
          container: base => ({ ...base, flex: 1 }),
          control: base => ({
            ...base,
            ...customStyles[size]?.control,
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
          }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            ...customStyles[size]?.option,
            cursor: 'pointer',
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
          }),
          singleValue: base => ({
            ...base,
            ...customStyles[size]?.singleValue,

            fontWeight: theme.fontWeights['medium' as any],
          }),
        }}
      />
      <Flex mx={2}>
        {renderSubmitButton &&
          renderSubmitButton({
            type: 'submit',
            w: '100%',
            isDisabled: false,
          })}
      </Flex>
    </Flex>
  );
};
