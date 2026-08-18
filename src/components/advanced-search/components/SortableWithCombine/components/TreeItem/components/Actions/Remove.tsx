import React from 'react';
import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { FaXmark } from 'react-icons/fa6';

interface RemoveProps extends Omit<IconButtonProps, 'id'> {
  id: UniqueIdentifier;
  handleClick: (id: UniqueIdentifier) => void;
}

export const Remove: React.FC<RemoveProps> = React.memo(props => {
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
      onClick={() => props.handleClick && props.handleClick(props.id)}
      _focus={{ boxShadow: 'none' }}
    >
      <Icon boxSize={4} transition='transform 250ms ease' asChild>
        <FaXmark />
      </Icon>
    </IconButton>
  );
});
