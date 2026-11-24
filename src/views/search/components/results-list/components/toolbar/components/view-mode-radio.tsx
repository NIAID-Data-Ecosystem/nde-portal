import { HStack, RadioGroup, RadioGroupRootProps } from '@chakra-ui/react';
import React from 'react';
import { VIEW_MODE_OPTIONS } from 'src/views/search/config/view-mode';
import { SearchViewMode } from 'src/views/search/types';

interface ViewModeRadioProps extends RadioGroupRootProps {
  label: string;
  value: SearchViewMode;
}

/*
 [COMPONENT INFO]: ViewModeRadio
  Lets the user choose how a tab's results are laid out (card or table).
*/
export const ViewModeRadio = ({
  id,
  label,
  size = 'sm',
  value,
  onValueChange,
  colorPalette = 'primary',
  ...props
}: ViewModeRadioProps) => {
  return (
    <RadioGroup.Root
      display='flex'
      flexDirection='column'
      justifyContent='center'
      gap={2}
      size={size}
      name={`view-mode-${id}`}
      value={value}
      onValueChange={onValueChange}
      colorPalette={colorPalette}
      variant='solid'
      {...props}
    >
      {/*
        RadioGroup.Label names the radiogroup: Ark points the root's
        aria-labelledby at this part's id, so no hand-made id is needed.
      */}
      <RadioGroup.Label fontWeight='medium'>{label}</RadioGroup.Label>
      {/*
        v3 requires the Item's inner parts explicitly: ItemHiddenInput is the
        real input the state machine listens to (without it the group is
        inert) and ItemIndicator draws the radio itself.
      */}
      <HStack gap={4} fontSize='sm'>
        {VIEW_MODE_OPTIONS.map(option => (
          <RadioGroup.Item key={option.value} value={option.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </HStack>
    </RadioGroup.Root>
  );
};
