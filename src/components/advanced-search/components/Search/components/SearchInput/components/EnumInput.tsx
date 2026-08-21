import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Flex } from '@chakra-ui/react';
import { AdvancedSearchInputProps } from '../types';
import { customStyles, selectColors } from '../../FieldSelect';
import { system } from 'src/theme';

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
        <Select
          defaultValue={defaultOption}
          isDisabled={disabled}
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
              borderColor: selectColors.border,
              boxShadow: 'none',
              ':hover': {
                borderColor: selectColors.border,
              },
              ':focus': {
                borderColor: selectColors.focusBorder,
                boxShadow: `0 0 0 1px ${selectColors.focusRing}`,
              },
              ':focus-within': {
                borderColor: selectColors.focusBorder,
                boxShadow: `0 0 0 1px ${selectColors.focusRing}`,
              },
            }),
            option: (base, { isFocused, isSelected }) => ({
              ...base,
              ...customStyles[size]?.option,
              cursor: 'pointer',
              backgroundColor: isSelected
                ? selectColors.optionSelectedBg
                : isFocused
                ? selectColors.optionHoverBg
                : 'transparent',
              color: isSelected ? 'white' : selectColors.optionText,
              ':hover': {
                background: isSelected
                  ? selectColors.optionSelectedBg
                  : selectColors.optionHoverBg,
              },
            }),
            singleValue: base => ({
              ...base,
              ...customStyles[size]?.singleValue,

              fontWeight: system.token('fontWeights.medium'),
            }),
          }}
        />
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
