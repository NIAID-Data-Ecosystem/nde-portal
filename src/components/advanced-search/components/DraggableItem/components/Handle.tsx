import React, { forwardRef } from 'react';
import { IconButton } from 'nde-design-system';

export const Handle = forwardRef<HTMLButtonElement, any>((props, ref) => {
  return (
    <IconButton
      colorScheme={props.colorScheme || 'primary'}
      bg={props.bg}
      color={props.color || 'white'}
      pl={2}
      pr={1}
      icon={
        // custom grip icon
        <svg viewBox='0 0 20 20' width='15' fill='currentColor'>
          <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
        </svg>
      }
      _focus={{ boxShadow: 'none' }}
      {...props}
    ></IconButton>
  );
});
