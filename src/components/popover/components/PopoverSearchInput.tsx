import React from 'react';
import { Flex, Input } from '@chakra-ui/react';

interface PopoverSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Consistent search-input row used inside selectable popovers.
 */
export const PopoverSearchInput = ({
  value,
  onChange,
  placeholder = 'Search',
}: PopoverSearchInputProps) => (
  <Flex px={2} py={1}>
    <Input
      size='sm'
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </Flex>
);
