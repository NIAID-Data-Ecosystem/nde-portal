export const Tag = {
  // Tag styles based on: https://designsystem.niaid.nih.gov/components/atoms
  baseStyle: () => {
    const baseStyles = {
      container: {
        borderRadius: 'semi',
      },
    };
    return baseStyles;
  },
  sizes: {
    sm: {
      container: {
        borderRadius: 'semi',
        px: 2,
        py: 1,
      },
    },
    md: {
      container: {
        borderRadius: 'semi',
        px: 3,
        py: 2,
      },
    },
    lg: {
      container: {
        borderRadius: 'semi',
        px: 5,
        py: 4,
      },
    },
  },

  defaultProps: {
    variant: 'solid',
  },
};
