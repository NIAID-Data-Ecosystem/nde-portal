import React from 'react';
import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { UniqueIdentifier } from '@dnd-kit/core';

interface ActionProps extends Omit<IconButtonProps, 'id'> {
  id: UniqueIdentifier;
  handleClick: (id: UniqueIdentifier) => void;
}
export const Action = React.memo((props: ActionProps) => {
  return (
    <IconButton
      aria-label={props['aria-label']}
      colorScheme={props.colorScheme || 'gray'}
      variant='ghost'
      bg={props.bg}
      color={props.color || 'gray.600'}
      pl={[2, 1]}
      pr={[2, 1]}
      mx={0.5}
      icon={props.icon}
      onClick={() => props.handleClick(props.id)}
      _focus={{ boxShadow: 'none' }}
    />
  );
});
