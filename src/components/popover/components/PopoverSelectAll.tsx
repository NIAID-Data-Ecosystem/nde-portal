import React from 'react';
import { Button, Flex } from '@chakra-ui/react';

interface PopoverSelectAllProps {
  allSelected: boolean;
  totalCount: number;
  onToggle: () => void;
  selectAllLabel?: string;
  clearAllLabel?: string;
}

/**
 * "Select All (N)" / "Clear All" toggle rendered in the popover
 * header.
 */
export const PopoverSelectAll = ({
  allSelected,
  totalCount,
  onToggle,
  selectAllLabel = 'Select All',
  clearAllLabel = 'Clear All',
}: PopoverSelectAllProps) => (
  <Flex justifyContent='flex-end' mt={1}>
    <Button size='xs' variant='link' colorScheme='black' onClick={onToggle}>
      {allSelected ? clearAllLabel : `${selectAllLabel} (${totalCount})`}
    </Button>
  </Flex>
);
