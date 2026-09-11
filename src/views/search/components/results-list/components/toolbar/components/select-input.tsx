import { Portal, Select, SelectRootProps, Span, Stack } from '@chakra-ui/react';
import React from 'react';

interface SelectWithLabelProps extends SelectRootProps {
  label: string;
}

export const SelectWithLabel = ({
  label,
  collection,
  size = 'sm',
  value,
  onValueChange,
  ...props
}: SelectWithLabelProps) => {
  return (
    <Select.Root
      collection={collection}
      size={size}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      <Select.HiddenSelect />
      <Select.Label>{label}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={`Select ${label.toLowerCase()}`} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map(option => (
              <Select.Item item={option} key={option.value}>
                <Stack gap='0'>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Span color='fg.muted' textStyle='xs'>
                    {option.description}
                  </Span>
                </Stack>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};
