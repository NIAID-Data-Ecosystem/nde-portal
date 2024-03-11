import {
  chakra,
  Flex,
  HStack,
  StackDivider,
  Text,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from '@chakra-ui/react';

interface RadioFilterProps {
  defaultValue: string;
  options: { name: string; value: string; count: number }[];
  handleChange: (value: string) => void;
}

export const RadioFilter = ({
  defaultValue,
  handleChange,
  options,
}: RadioFilterProps) => {
  interface RadioOptions extends UseRadioProps {
    count: number;
    label: string;
  }
  const RadioOptions = ({ count, label, ...props }: RadioOptions) => {
    const { state, getInputProps, getRadioProps, htmlProps, getLabelProps } =
      useRadio(props);
    return (
      <chakra.label {...htmlProps} cursor='pointer'>
        <input {...getInputProps({})} hidden />
        <Flex
          {...getRadioProps({
            height: '100%',
          })}
        >
          <HStack
            {...getLabelProps({
              display: 'flex',
              alignItems: 'center',
              bg: state.isChecked ? 'white' : 'transparent',
              border: '1px',
              borderColor: state.isChecked ? 'gray.100' : 'transparent',
              boxShadow: state.isChecked ? 'sm' : 'none',
              px: 4,
              py: 2,
              borderRadius: 'semi',
              fontSize: 'sm',
              fontWeight: 'medium',
              lineHeight: 'shorter',
            })}
          >
            <Text fontWeight='medium'>{label}</Text>
            <Text fontSize='xs' color='gray.800' opacity='0.9'>
              {count}
            </Text>
          </HStack>
        </Flex>
      </chakra.label>
    );
  };

  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue,
    onChange: value => handleChange(value),
  });

  return (
    <HStack
      bg='blackAlpha.50'
      borderRadius='semi'
      alignItems='unset'
      spacing={0}
      p={0.25}
      divider={
        <StackDivider
          borderColor='gray.200'
          px={0}
          h='50%'
          alignSelf='center'
        />
      }
      {...getRootProps}
    >
      {options.map(option => {
        return (
          <RadioOptions
            key={option.name}
            label={option.name}
            count={option.count}
            {...getRadioProps({ value: option.value })}
          />
        );
      })}
    </HStack>
  );
};
