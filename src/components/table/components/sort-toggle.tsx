import { Button, Icon, IconButtonProps, Stack } from '@chakra-ui/react';
import React from 'react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';

// Based on NIAID's Table Styles
// https://designsystem.niaid.nih.gov/components/atoms

export interface TableSortToggleProps {
  columnName?: string;
  colorPalette?: IconButtonProps['colorPalette'];
  isSelected: boolean;
  sortBy: 'ASC' | 'DESC';
  handleToggle: (sortByAsc: boolean) => void;
}

// Toggle rows sort order buttons. Should be put in header cells (Th).
export const TableSortToggle = ({
  columnName = 'column',
  colorPalette = 'niaid',
  isSelected,
  sortBy,
  handleToggle,
}: TableSortToggleProps) => {
  return (
    <Tooltip
      content={`Sort column by ${columnName ? columnName.toLowerCase() : ''} ${
        sortBy === 'ASC' ? 'descending' : 'ascending'
      }`}
    >
      <Button
        size='2xs'
        colorPalette={colorPalette}
        variant='ghost'
        height='unset'
        width='unset'
        px={0}
        aria-label={`sort table column ${
          isSelected && sortBy === 'DESC' ? 'ascending' : 'descending'
        }`}
        onClick={() => handleToggle(sortBy === 'ASC' ? false : true)}
      >
        <Stack flexDirection='column' gap={0.25}>
          <Icon
            as={FaCaretUp}
            color={
              isSelected && sortBy === 'ASC' ? 'inherit' : 'colorPalette.200'
            }
            boxSize={3}
          />
          <Icon
            as={FaCaretDown}
            color={
              isSelected && sortBy === 'DESC' ? 'inherit' : 'colorPalette.200'
            }
            boxSize={3}
          />
        </Stack>
      </Button>
    </Tooltip>
  );
};
