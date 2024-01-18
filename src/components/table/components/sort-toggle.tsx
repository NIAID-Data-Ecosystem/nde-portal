import React from 'react';
import { Flex, IconButton } from '@chakra-ui/react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa6';

// Based on NIAID's Table Styles
// https://designsystem.niaid.nih.gov/components/atoms

// Toggle rows sort order buttons. Should be put in header cells (Th).
export const TableSortToggle = ({
  isSelected,
  sortBy,
  handleToggle,
}: {
  isSelected: boolean;
  sortBy: 'ASC' | 'DESC';
  handleToggle: (sortByAsc: boolean) => void;
}) => {
  return (
    <Flex display='inline-flex' ml={2}>
      <IconButton
        icon={<FaCaretUp />}
        aria-label='sort table column ascending'
        ml={1}
        colorScheme='gray'
        variant='ghost'
        size='xs'
        color={isSelected && sortBy === 'ASC' ? 'inherit' : 'gray.200'}
        onClick={() => handleToggle(true)}
      />
      <IconButton
        icon={<FaCaretDown />}
        aria-label='sort table column descending'
        ml={1}
        colorScheme='gray'
        size='xs'
        variant='ghost'
        color={isSelected && sortBy === 'DESC' ? 'inherit' : 'gray.200'}
        onClick={() => handleToggle(false)}
      />
    </Flex>
  );
};
