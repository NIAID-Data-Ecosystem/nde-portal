export const Table = {
  // Table styles based on: https://designsystem.niaid.nih.gov/components/atoms
  parts: ['pagination', 'wrapper', 'caption'],
  baseStyle: (props: { borderColor: any; colorScheme: string }) => {
    let borderColor = props.borderColor;

    if (props.colorScheme === 'gray') {
      borderColor = 'gray.400';
    } else if (props.colorScheme === 'primary') {
      borderColor = 'primary.500';
    } else if (props.colorScheme === 'secondary') {
      borderColor = 'secondary.500';
    }

    const baseStyles = {
      pagination: {
        display: 'flex',
        w: '100%',
        bg: '#fff',
        borderTop: '.0625rem solid',
        borderColor: props.colorScheme
          ? `${props.colorScheme}.200`
          : 'gray.200',
        flexDirection: ['column-reverse', 'row'],
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      },
      wrapper: {
        border: '.0625rem solid',
        borderColor: props.colorScheme
          ? `${props.colorScheme}.200`
          : 'gray.200',
        borderRadius: 'semi',
        overflow: 'auto',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        minW: '250px',
      },
      thead: {
        background: 'white',
        tr: {
          th: {
            color: 'text.body',
            borderBottom: '0.25rem solid',
            borderColor,
            mb: 1,
            position: 'relative',
          },
        },
      },
      tbody: {
        tr: {
          td: {
            p: 4,
          },
        },
      },

      tfoot: {
        background: 'white',
        tr: {
          th: {
            color: 'text.body',
            borderTop: '0.25rem solid',
            borderColor,
            mb: 1,
          },
        },
      },
      caption: {
        borderTop: '.0625rem solid',
        borderColor: props.colorScheme
          ? `${props.colorScheme}.200`
          : 'gray.200',
      },
    };

    return baseStyles;
  },
  sizes: {
    sm: {},
    md: {},
    lg: {
      // Following NIAID's specs : https://designsystem.niaid.nih.gov/components/atoms
      thead: {
        tr: {
          th: {
            p: 4,
          },
        },
      },
      tbody: {
        tr: {
          td: {
            p: 4,
          },
        },
      },
      tfoot: {
        tr: {
          th: {
            p: 4,
          },
        },
      },
    },
  },
  variants: {
    striped: {
      tbody: {
        tr: {
          '&:nth-of-type(odd)': {
            'th, td': {
              borderBottomWidth: '1px',
              borderColor: 'white',
            },
            td: {
              background: 'white',
            },
          },
          '&:nth-of-type(even)': {
            'th, td': {
              borderBottomWidth: '1px',
              borderColor: 'page.alt',
            },
            td: {
              background: 'page.alt',
            },
          },
        },
      },
    },
  },
  defaultProps: {
    size: 'lg',
    variant: 'striped',
    colorScheme: 'primary',
  },
};
