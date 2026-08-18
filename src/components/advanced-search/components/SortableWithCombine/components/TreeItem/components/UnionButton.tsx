import React from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import {
  DropdownButton,
  DropdownButtonProps,
} from 'src/components/dropdown-button';
import {
  getUnionTheme,
  unionOptions,
} from 'src/components/advanced-search/utils/query-helpers';
import { UnionTypes } from 'src/components/advanced-search/types';

interface UnionButtonProps
  extends Pick<DropdownButtonProps, 'colorPalette' | 'selectedOption'> {
  id: UniqueIdentifier;
  setSelectedOption:
    | ((id: UniqueIdentifier, union: UnionTypes) => void)
    | undefined;
}

export const UnionButton = React.memo((props: UnionButtonProps) => {
  const { colorPalette, selectedOption } = props;
  return (
    <DropdownButton
      size='sm'
      ariaLabel='union between query elements'
      onClick={() => {}}
      options={unionOptions.map(term => {
        return {
          name: `${term}`,
          value: term,
          props: {
            bg: getUnionTheme(term).bg,
            _hover: getUnionTheme(term)._hover,
            fontSize: 'xs',
            textAlign: 'left',
          },
        };
      })}
      colorPalette={colorPalette}
      selectedOption={selectedOption}
      setSelectedOption={union => {
        const unionValue = union as UnionTypes;
        props.setSelectedOption &&
          props.setSelectedOption(props.id, unionValue);
      }}
    />
  );
});
