import { Flex, RadioGroup, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { VIEW_MODE_OPTIONS } from 'src/views/search/config/view-mode';
import { SearchViewMode, TabType } from 'src/views/search/types';

interface ViewModeRadioProps {
  /** Tab this control belongs to. Used to keep radio names unique. */
  id: TabType['id'];
  value: SearchViewMode;
  onChange: (next: SearchViewMode) => void;
}

/*
 [COMPONENT INFO]: ViewModeRadio
  Lets the user choose how a tab's results are laid out (card or table).
*/
export const ViewModeRadio = ({ id, value, onChange }: ViewModeRadioProps) => {
  const labelId = `view-mode-label-${id}`;

  return (
    <Flex alignItems='center' gap={2}>
      <Text
        as='span'
        id={labelId}
        fontSize='sm'
        whiteSpace='nowrap'
        color='gray.900'
      >
        View mode:
      </Text>
      <RadioGroup.Root
        size='sm'
        name={`view-mode-${id}`}
        aria-labelledby={labelId}
        value={value}
        onValueChange={({ value }) => onChange(value as SearchViewMode)}
      >
        {/*
          v3 requires the Item's inner parts explicitly: ItemHiddenInput is the
          real input the state machine listens to (without it the group is
          inert) and ItemControl draws the radio itself.
        */}
        <Stack direction='row' gap={4} fontSize='sm'>
          {VIEW_MODE_OPTIONS.map(option => (
            <RadioGroup.Item key={option.value} value={option.value}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>
    </Flex>
  );
};
