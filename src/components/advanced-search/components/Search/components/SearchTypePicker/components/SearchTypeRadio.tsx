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
    {/* As in v2, a disabled search type shows no tooltip. */}
    <SearchTypeTooltip
      description={description}
      example={example}
      disabled={props.disabled}
    >
      {/* v3 fades only the control of a disabled item; v2 also faded its label. */}
      <RadioGroup.ItemText
        fontSize='sm'
        fontWeight='medium'
        color='gray.800'
        _disabled={{ opacity: 0.4 }}
      >
        {label}
      </RadioGroup.ItemText>
    </SearchTypeTooltip>
  </RadioGroup.Item>
);
