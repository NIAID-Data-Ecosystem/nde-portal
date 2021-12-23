const Button = {
  // The styles all button have in common
  baseStyle: {
    borderRadius: 'base', // <-- border radius is same for all variants and sizes
    fontWeight: 'normal',
    fontFamily: 'body',
  },
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 4, // <-- px is short for paddingLeft and paddingRight
      py: 3, // <-- py is short for paddingTop and paddingBottom
    },
    md: {
      fontSize: 'md',
      px: 8, // <-- these values are tokens from the design system
      py: 4, // <-- these values are tokens from the design system
    },
  },
  // Two variants: outline and solid
  variants: {
    solid: ({colorScheme, ...props}: {colorScheme: string}) => {
      let bg;
      let hoverBg;
      let color;

      if (colorScheme === 'red') {
        bg = 'nde.status.error';
        hoverBg = 'red.700';
        color = 'white';
      }
      return {
        bg,
        _hover: {
          bg: hoverBg,
          _disabled: {
            bg,
          },
        },
      };
    },

    outline: ({colorScheme}: {colorScheme: string}) => {
      let borderColor;
      let color;
      let hoverBg;
      let bg;

      if (colorScheme === 'red') {
        borderColor = 'nde.status.error';
        color = 'nde.status.error';
        hoverBg = 'red.50';
      }
      return {
        border: '1px solid',
        color,
        bg,
        _hover: {
          bg: hoverBg,
          _disabled: {
            bg,
          },
        },
      };
    },
  },
  // The default size and variant values
  defaultProps: {
    size: 'md',
    variant: 'solid',
    colorScheme: 'primary',
  },
};

export default Button;
