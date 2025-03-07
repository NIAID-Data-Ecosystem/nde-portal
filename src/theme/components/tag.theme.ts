import { theme } from 'src/theme';
export const Tag = {
  // Tag styles based on: https://designsystem.niaid.nih.gov/components/atoms
  baseStyle: () => {
    const baseStyles = {
      container: {
        borderRadius: 'semi',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'top',
        lineHeight: '1.2',
        maxWidth: '100%',
        outline: 0,
        userSelect: 'none',
        focusVisibleRing: 'outside',
      },
      label: {
        lineClamp: '1',
        lineHeight: '1rem',
      },
      closeButton: {
        fontSize: 'lg',
        w: '5',
        h: '5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        outline: '0',
        borderRadius: 'l1',
        color: 'currentColor',
        focusVisibleRing: 'inside',
        focusRingWidth: '2px',
        svg: {
          width: '1em',
          height: '1em',
        },
      },
    };
    return baseStyles;
  },
  sizes: {
    sm: {
      container: {
        gap: '1',
        py: 0.5,
        '--tag-font-size': 'fontSizes.xs',
        '--tag-min-height': 'space.4',
        '--tag-padding-inline': 'space.1.5',
        svg: {
          width: '3',
          height: '3',
        },
      },
    },
    md: {
      container: {
        gap: '1',
        py: 1,
        '--tag-font-size': 'fontSizes.xs',
        '--tag-min-height': 'space.5',
        '--tag-padding-inline': 'space.2',

        svg: {
          width: '3',
          height: '3',
        },
      },
    },
    lg: {
      container: {
        gap: '1.5',
        py: 1,
        '--tag-font-size': 'fontSizes.xs',
        '--tag-min-height': 'space.6',
        '--tag-padding-inline': 'space.2.5',
        svg: {
          width: '4',
          height: '4',
        },
      },
    },
    xl: {
      container: {
        gap: '1.5',
        '--tag-font-size': 'fontSizes.md',
        '--tag-min-height': 'space.8',
        '--tag-padding-inline': 'space.2.5',

        svg: {
          width: '4',
          height: '4',
        },
      },
    },
  },
  variants: {
    subtle: ({ colorScheme, ...props }: { colorScheme: string }) => {
      const shadowColor =
        theme.colors[colorScheme]?.[200] || 'rgba(0, 0, 0, 0.2)';
      return {
        container: {
          '--tag-shadow': `inset 0 0 0px 1px ${shadowColor}`,
        },
      };
    },
  },

  defaultProps: {
    variant: 'solid',
    size: 'md',
  },
};
