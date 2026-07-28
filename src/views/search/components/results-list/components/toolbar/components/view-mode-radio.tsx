import React from 'react';
import {
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';

export type ViewMode = 'card' | 'table';

interface ViewModeRadioProps {
  /** Unique suffix so multiple results lists on a page keep distinct radio groups. */
  id: string;
  value: ViewMode;
  onChange: (viewMode: ViewMode) => void;
}

/**
 * Card / Table switch for the Dataset and Computational Tool result lists.
 *
 * Rendered as a fieldset + legend so assistive technology announces the two
 * radios as one labelled group.
 */
export const ViewModeRadio = ({ id, value, onChange }: ViewModeRadioProps) => (
  <FormControl
    as='fieldset'
    display='flex'
    alignItems='center'
    flexWrap='wrap'
    width='auto'
  >
    <FormLabel as='legend' fontSize='sm' fontWeight='medium' mb={0} mr={2}>
      View mode:
    </FormLabel>
    <RadioGroup
      name={`view-mode-${id}`}
      value={value}
      onChange={nextValue => onChange(nextValue as ViewMode)}
      size='sm'
      colorScheme='primary'
    >
      <Stack direction='row' spacing={4}>
        <Radio value='card'>Card</Radio>
        <Radio value='table'>Table</Radio>
      </Stack>
    </RadioGroup>
  </FormControl>
);
