import {
  Fieldset,
  Flex,
  HStack,
  RadioGroup,
  RadioGroupRootProps,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { VIEW_MODE_OPTIONS } from 'src/views/search/config/view-mode';
import { SearchViewMode, TabType } from 'src/views/search/types';

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
  const labelId = `view-mode-label-${id}`;

  return (
    <Fieldset.Root
      gap={2}
      size={size as 'sm' | 'md' | 'lg'}
      width='unset'
      justifyContent='center'
    >
      <Fieldset.Legend>{label}</Fieldset.Legend>
      <Fieldset.Content>
        <RadioGroup.Root
          size={size}
          name={`view-mode-${id}`}
          aria-labelledby={labelId}
          value={value}
          onValueChange={onValueChange}
          colorPalette={colorPalette}
          variant='solid'
          {...props}
        >
          {/*
          v3 requires the Item's inner parts explicitly: ItemHiddenInput is the
          real input the state machine listens to (without it the group is
          inert) and ItemControl draws the radio itself.
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
      </Fieldset.Content>
    </Fieldset.Root>
  );
};
