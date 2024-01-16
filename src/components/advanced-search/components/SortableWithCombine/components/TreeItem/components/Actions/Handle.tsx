import React, { forwardRef } from 'react';
import { IconButton } from '@chakra-ui/react';

export const Handle = React.memo(
  forwardRef<HTMLButtonElement, any>((props, ref) => {
    return (
      <IconButton
        ref={ref}
        colorScheme={props.colorScheme || 'gray'}
        variant='ghost'
        bg={props.bg}
        color={props.color || 'gray.600'}
        pl={[2, 1]}
        pr={[2, 1]}
        mx={0.5}
        icon={
          <svg viewBox='0 0 20 20' width='15' fill='currentColor'>
            <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
          </svg>
        }
        _focus={{ boxShadow: 'none' }}
        {...props}
      ></IconButton>
    );
  }),
);
