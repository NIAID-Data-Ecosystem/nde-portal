export const Button = {
  // The styles all buttons have in common
  baseStyle: () => {
    return {
      borderRadius: 'semi',
      fontWeight: 'normal',
      fontFamily: 'body',
      // _visited: { color: 'white' },
    };
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 3, // <-- these values are tokens from the design system
      py: 1.5, // <-- these values are tokens from the design system
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
      const colorMap = {
        negative: { bg: 'status.error', hoverBg: 'red.700' },
      };

      const config = colorMap[colorScheme as keyof typeof colorMap];

      if (!config) return {};
      const bg = config?.bg;
      const hoverBg = config?.hoverBg;
      const color = props.color || 'white';

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
      const colorMap = {
        negative: {
          color: 'status.error',
          hoverBg: 'red.600',
          borderColor: 'status.error',
        },
        primary: {
          color: 'primary.500',
          hoverBg: 'primary.600',
          borderColor: 'primary.500',
        },
        secondary: {
          color: 'secondary.500',
          hoverBg: 'secondary.600',
          borderColor: 'secondary.500',
        },
        gray: {
          color: 'gray.900',
          hoverBg: 'gray.800',
          borderColor: 'gray.200',
        },
      };

      const config = colorMap[colorScheme as keyof typeof colorMap];
      if (!config) return {};

      const color = config.color || props.color;
      const borderColor = config.borderColor || props.color;
      const hoverColor = 'white';
      const bg = 'white';

      const hoverAndActive = {
        borderColor: config.hoverBg,
        bg: config.hoverBg,
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
      const colorMap = {
        negative: { color: 'red.700', hoverBg: 'red.50' },
        primary: { color: 'primary.700', hoverBg: 'primary.50' },
        secondary: { color: 'secondary.700', hoverBg: 'secondary.50' },
      };

      const config = colorMap[colorScheme as keyof typeof colorMap];

      if (!config) return {};

      const color = config?.color || props.color || 'inherit';
      const hoverBg = config?.hoverBg;

      return {
        color,
        '.child-string, .child-node, .child-node p, svg': {
          color,
        },
        _hover: {
          bg: hoverBg,
          _disabled: {
            bg: undefined,
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
    link: () => {
      return {
        textDecoration: 'underline',

        _hover: {
          textDecoration: 'none',
        },
      };
    },
    unstyled: () => {
      return {
        background: 'transparent',
        color: 'inherit',

        _hover: {
          background: 'transparent',
          color: 'inherit',
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
