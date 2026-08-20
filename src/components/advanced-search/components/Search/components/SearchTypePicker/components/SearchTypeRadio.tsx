import { RadioGroup } from '@chakra-ui/react';

import { SearchTypesConfigProps } from '../../../search-types-config';
import { SearchTypeTooltip } from './SearchTypeTooltip';

interface SearchTypeRadioProps
  extends RadioGroup.ItemProps,
    Pick<SearchTypesConfigProps, 'label'>,
    Partial<Pick<SearchTypesConfigProps, 'description' | 'example'>> {}

/** One search type in the picker, described by a tooltip on its label. */
export const SearchTypeRadio = ({
  label,
  description,
  example,
  ...props
}: SearchTypeRadioProps) => (
  <RadioGroup.Item {...props}>
    <RadioGroup.ItemHiddenInput />
    <RadioGroup.ItemIndicator />
    <SearchTypeTooltip description={description} example={example}>
      <RadioGroup.ItemText fontSize='sm' fontWeight='medium' color='gray.800'>
        {label}
      </RadioGroup.ItemText>
    </SearchTypeTooltip>
  </RadioGroup.Item>
);
