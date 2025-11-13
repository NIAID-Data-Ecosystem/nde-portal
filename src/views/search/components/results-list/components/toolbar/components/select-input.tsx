import {
  createListCollection,
  Portal,
  Select,
  SelectRootProps,
  Span,
  Stack,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';

interface SelectWithLabelProps
  extends Omit<SelectRootProps, 'collection' | 'items'> {
  id: string;
  label: string;
  handleChange: (value: string | number) => void;
  items: { label: string; value: string | number; tooltip?: string }[];
}

/*
 [COMPONENT INFO]: SelectWithLabel
  Handles a select input with a label and options and optional tooltips.
*/

export const SelectWithLabel = ({
  id,
  label,
  items,
  size = 'sm',
  value,
  handleChange,
  colorPalette = 'niaid',
  ...props
}: SelectWithLabelProps) => {
  const collection = useMemo(
    () =>
      createListCollection({
        items,
      }),
    [items],
  );

  return (
    <>
      <VisuallyHidden>
        <label htmlFor={id} title={label}>
          {label}
        </label>
      </VisuallyHidden>
      <Select.Root
        collection={collection}
        colorPalette={colorPalette}
        size={size}
        value={value}
        onValueChange={e => handleChange(e.value[0])}
        {...props}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={label} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {collection.items.map(item => (
                <Select.Item
                  item={item}
                  key={item.value}
                  _highlighted={{
                    bg: `${colorPalette}.emphasized`,
                  }}
                >
                  <Stack gap='0'>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Span color='fg.muted' textStyle='xs'>
                      {item.tooltip}
                    </Span>
                  </Stack>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </>
  );
};
