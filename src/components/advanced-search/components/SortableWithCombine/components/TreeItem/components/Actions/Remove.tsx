import React from 'react';
import { Icon, IconButton, IconButtonProps } from 'nde-design-system';
import { IoClose } from 'react-icons/io5';
import { UniqueIdentifier } from '@dnd-kit/core';

interface RemoveProps extends Omit<IconButtonProps, 'id'> {
  id: UniqueIdentifier;
  handleClick: (id: UniqueIdentifier) => void;
}

export const Remove: React.FC<RemoveProps> = React.memo(props => {
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
      icon={<Icon as={IoClose} boxSize={4} transition='transform 250ms ease' />}
      onClick={() => props.handleClick && props.handleClick(props.id)}
      _focus={{ boxShadow: 'none' }}
    />
  );
});
