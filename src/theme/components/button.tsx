export const Button = {
  // The styles all buttons have in common
  baseStyle: () => {
    return {
      borderRadius: 'semi',
      fontWeight: 'normal',
      fontFamily: 'body',
      _visited: { color: 'white' },
      _hover: {
        color: 'inherit',
      },
    };
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 4,
      py: 3,
    },
    md: {
      fontSize: 'md',
      px: 8, // <-- these values are tokens from the design system
      py: 4, // <-- these values are tokens from the design system
    },
    base: {
      height: 'unset',
      px: 8, // <-- these values are tokens from the design system
      py: 4, // <-- these values are tokens from the design system
    },
  },
  variants: {
    solid: ({
      colorScheme,
      ...props
    }: {
      colorScheme: string;
      color?: string;
    }) => {
      let bg;
      let hoverBg;
      const color = props.color || 'white';

      if (colorScheme === 'negative') {
        bg = 'status.error';
        hoverBg = 'red.700';
      }

      return {
        bg,
        color,
        border: '1px solid',

        borderColor: bg ? bg : 'transparent',
        _hover: {
          color,
          bg: hoverBg,
          borderColor: hoverBg,
          _disabled: {
            bg,
          },
        },
        _visited: {
          '.child-string, .child-node, .child-node p, svg': { color },
        },
      };
    },
    outline: ({
      colorScheme,
      ...props
    }: {
      colorScheme?: string;
      color: string;
    }) => {
      let color = 'inherit';
      let borderColor = 'inherit';
      let hoverBg;
      const hoverColor = 'white';
      const bg = 'white';

      if (colorScheme === 'negative') {
        color = props.color || 'status.error';
        borderColor = color;
        hoverBg = 'red.600';
      }
      if (colorScheme === 'primary') {
        color = props.color || 'primary.500';
        borderColor = color;
        hoverBg = 'primary.600';
      }
      if (colorScheme === 'secondary') {
        color = props.color || 'secondary.500';
        borderColor = color;
        hoverBg = 'secondary.600';
      }

      if (colorScheme === 'gray') {
        color = 'gray.900';
        borderColor = 'gray.200';
        hoverBg = 'gray.800';
      }

      const hoverAndActive = {
        borderColor: hoverBg,
        bg: hoverBg,
        color: hoverColor,
        '.child-string, .child-node, .child-node p, svg': {
          color: hoverColor,
        },
        _disabled: {
          bg,
          color,
          borderColor,
          '.child-string, .child-node, .child-node p, svg': {
            color,
          },
        },
      };

      return {
        borderColor,
        color,
        bg,

        _hover: hoverAndActive,
        _active: hoverAndActive,
        _visited: {
          color,
          '.child-string, .child-node, .child-node p, svg': {
            color,
          },
          _hover: {
            color: hoverColor,
            '.child-string, .child-node, .child-node p, svg': {
              color: hoverColor,
            },
          },
        },
      };
    },
    ghost: ({
      colorScheme,
      ...props
    }: {
      colorScheme: string;
      color?: string;
    }) => {
      let bg;
      let hoverBg;
      let color = props.color || 'inherit';
      if (colorScheme === 'negative') {
        hoverBg = 'red.50';
        color = props.color || 'red.700';
      }
      if (colorScheme === 'primary') {
        hoverBg = 'primary.50';
        color = props.color || 'primary.700';
      }
      if (colorScheme === 'secondary') {
        hoverBg = 'secondary.50';
        color = props.color || 'secondary.700';
      }
      return {
        bg,
        color,
        '.child-string, .child-node, .child-node p, svg': {
          color,
        },
        _hover: {
          bg: hoverBg,
          _disabled: {
            bg,
          },
        },
        _visited: {
          color,
          '.child-string, .child-node, .child-node p, svg': {
            color,
          },
        },
      };
    },
    unstyled: () => {
      return {
        background: 'transparent',
        _hover: {
          background: 'transparent',
        },
      };
    },
  },
  // The default size and variant values
  defaultProps: {
    size: 'base',
    variant: 'solid',
    colorScheme: 'primary',
  },
};
