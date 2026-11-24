import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';

interface ActionProps extends Omit<IconButtonProps, 'id'> {
  id: UniqueIdentifier;
  handleClick: (id: UniqueIdentifier) => void;
}
export const Action = React.memo((props: ActionProps) => {
  return (
    <IconButton
      aria-label={props['aria-label']}
      colorPalette={props.colorPalette || 'gray'}
      variant='ghost'
      bg={props.bg}
      color={props.color || 'gray.600'}
      pl={[2, 1]}
      pr={[2, 1]}
      mx={0.5}
      // v3's size variant fixes icon buttons at 40x40. v2's were as narrow as
      // their icon and stretched to the row, which keeps tree rows compact.
      minW='auto'
      h='auto'
      onClick={() => props.handleClick(props.id)}
      _focus={{ boxShadow: 'none' }}
    >
      {props.children}
    </IconButton>
  );
});
