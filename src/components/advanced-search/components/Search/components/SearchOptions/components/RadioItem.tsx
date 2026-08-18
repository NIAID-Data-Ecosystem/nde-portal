import { RadioGroup, Text } from '@chakra-ui/react';
import Tooltip from '../../../../../../tooltip';
import { SearchTypesConfigProps } from '../../../search-types-config';

export const RadioTooltip: React.FC<Partial<RadioItemProps>> = ({
  children,
  isDisabled,
  description,
  example,
}) => {
  return (
    <Tooltip
      showArrow
      disabled={isDisabled}
      whiteSpace='pre-line'
      content={
        <>
          {description && (
            <>
              {description}
              <br />
            </>
          )}
          {example && (
            <>
              Example
              <br />
              {example}
            </>
          )}
        </>
      }
    >
      <div>{children}</div>
    </Tooltip>
  );
};

interface RadioItemProps
  extends Omit<RadioGroup.ItemProps, 'name' | 'value'>,
    Omit<SearchTypesConfigProps, 'id' | 'value'> {
  hasTooltip?: boolean;
}

export const RadioItem: React.FC<RadioItemProps> = ({
  label,
  description,
  example,
  hasTooltip,
  isDisabled,
  children,
  ...props
}) => {
  const RadioText = ({ name }: { name: string }) => {
    return (
      <Text fontSize='sm' fontWeight='medium' color='gray.800'>
        {name}
      </Text>
    );
  };
  return (
    <RadioGroup.Item
      disabled={isDisabled}
      _focus={{
        boxShadow: props.isChecked && !isDisabled ? 'outline' : 'none',
      }}
      {...props}
    >
      {hasTooltip && (description || example) ? (
        <RadioTooltip
          isDisabled={isDisabled}
          description={description}
          example={example}
        >
          {label && <RadioText name={label} />}
        </RadioTooltip>
      ) : (
        <>{label && <RadioText name={label} />}</>
      )}
    </RadioGroup.Item>
  );
};
