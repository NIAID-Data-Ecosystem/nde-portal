import { theme } from 'src/theme';

const styleInputBorder = (colorScheme: string) => {
  let borderColor = 'inherit';
  if (colorScheme === 'primary') {
    borderColor = theme.colors.primary[500];
  } else if (colorScheme === 'secondary') {
    borderColor = theme.colors.secondary[500];
  } else if (colorScheme === 'gray') {
    borderColor = theme.colors.gray[200];
  } else if (colorScheme === 'niaid') {
    borderColor = theme.colors.link.color;
  }
  return borderColor;
};
export const Input = {
  baseStyle: () => {
    return {
      field: {
        fontWeight: 'light',
        _placeholder: {
          color: 'niaid.placeholder',
        },
      },
    };
  },
  sizes: {
    md: {
      field: {
        h: 12,
      },
    },
    lg: {
      field: {
        h: 14,
      },
    },
  },
  variants: {
    outline: ({ colorScheme }: { colorScheme: string }) => {
      const borderColor = styleInputBorder(colorScheme);
      return {
        field: {
          borderRadius: 'semi',
          _focus: {
            borderColor,
            boxShadow: `0 0 0 0.0625rem ${borderColor}, 0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)`,
          },
          _focusWithin: {
            borderColor,
            boxShadow: `0 0 0 0.0625rem ${borderColor}, 0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)`,
          },
        },
      };
    },
    filled: ({ colorScheme }: { colorScheme: string }) => {
      const borderColor = styleInputBorder(colorScheme);
      return {
        field: {
          _focus: {
            borderColor,
          },
          _focusWithin: {
            borderColor,
          },
        },
      };
    },
    flushed: ({ colorScheme }: { colorScheme: string }) => {
      const borderColor = styleInputBorder(colorScheme);
      return {
        field: {
          _focus: {
            borderColor,
            boxShadow: `0px 1px 0px 0px ${borderColor}`,
          },
          _focusWithin: {
            borderColor,
            boxShadow: `0px 1px 0px 0px ${borderColor}`,
          },
        },
      };
    },
    shadow: ({ colorScheme }: { colorScheme: string }) => {
      const borderColor = styleInputBorder(colorScheme);

      return {
        field: {
          borderRadius: 'semi',
          border: '.0625rem solid',
          borderColor: 'gray.200',
          _hover: {},
          _focus: {
            borderColor,
            boxShadow: 'sm',
          },
        },
      };
    },
  },
  // The default size and variant values
  defaultProps: {
    size: 'sm',
    variant: 'outline',
    colorScheme: 'gray',
    _placeholder: { color: 'niaid.placeholder' },
  },
};
