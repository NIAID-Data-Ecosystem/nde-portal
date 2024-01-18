import { ListItemProps } from '@chakra-ui/react';
import { TreeItemComponentProps } from '.';

export const getStyles = ({
  clone,
  disableInteraction,
  ghost,
  indicator,
}: Partial<TreeItemComponentProps>) => {
  let styles = {
    pointerEvents: disableInteraction ? 'none' : 'inherit',
    sx: {
      ['.tree-item']: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        color: '#222',
        bg: '#fff',
        px: 0.5,
        py: 1,
        boxSizing: 'border-box',
        borderRadius: 'base',
      },
    },
  } as ListItemProps;

  if (clone) {
    styles = {
      ...styles,
      display: 'inline-block',
      zIndex: 10000,
      pointerEvents: 'none',
      p: 0,
      pt: '5px',
      pl: '10px',
    };
  }

  if (ghost) {
    if (indicator) {
      return {
        ...styles,
        opacity: 1,
        position: 'relative',
        mb: '-1px',
        zIndex: 10000,
        py: 1,
        height: 0,
        sx: {
          ['.wrapper']: {
            bg: 'transparent',
            border: 'none',
            padding: 0,
          },
          ['.item']: {
            bg: '#AED5FC',
          },
          ['.tree-item']: {
            position: 'relative',
            padding: 0,
            height: '8px',
            borderColor: '#2389ff',
            bg: '#2483E2',
            '&:before': {
              position: 'absolute',
              top: '-0.25rem',
              left: '-0.5rem',
              display: 'block',
              content: "''",
              height: '1rem',
              width: '1rem',
              borderRadius: '50%',
              border: '1px solid #2483E2',
              bg: '#ffffff',
            },

            '> *': {
              /* Items are hidden using height and opacity to retain focus */
              opacity: 0,
              height: 0,
            },
          },
        },
      };
    }
    return {
      ...styles,
      opacity: !indicator ? 0.5 : 1,
      sx: {
        ['.tree-item']: {
          '> *': {
            bg: 'transparent',
          },
        },
      },
    };
  }
  return styles;
};
