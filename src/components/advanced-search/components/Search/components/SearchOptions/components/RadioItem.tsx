import { Radio, RadioProps } from '@chakra-ui/react';
import { Text, Tooltip } from 'nde-design-system';
import { SearchOption } from '../../AdvancedSearchFormContext';

export const RadioTooltip: React.FC<Partial<RadioItemProps>> = ({
  children,
  isDisabled,
  description,
  example,
}) => {
  return (
    <Tooltip
      hasArrow
      isDisabled={isDisabled}
      whiteSpace='pre-line'
      label={
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
  extends Omit<RadioProps, 'name' | 'value'>,
    Omit<SearchOption, 'value'> {
  hasTooltip?: boolean;
  value?: SearchOption['value'];
}

export const RadioItem: React.FC<RadioItemProps> = ({
  name,
  value,
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
    <Radio value={value} isDisabled={isDisabled} {...props}>
      {hasTooltip && (description || example) ? (
        <RadioTooltip
          isDisabled={isDisabled}
          description={description}
          example={example}
        >
          {name && <RadioText name={name} />}
        </RadioTooltip>
      ) : (
        <>{name && <RadioText name={name} />}</>
      )}
    </Radio>
  );
};
