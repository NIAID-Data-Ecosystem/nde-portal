import { useState } from 'react';
import Select from 'react-select';
import { Flex, theme } from 'nde-design-system';
import { AdvancedSearchInputProps } from '../types';

interface EnumInputProps extends AdvancedSearchInputProps {
  options?: {
    label: string;
    value: string;
  }[];
}

export const EnumInput: React.FC<EnumInputProps> = ({
  isDisabled,
  options = [],
  handleSubmit,
  renderSubmitButton,
}) => {
  const defaultOption = options[0];
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(defaultOption);

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
          container: base => ({ ...base, flex: 1 }),
          control: base => ({
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
          }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
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
