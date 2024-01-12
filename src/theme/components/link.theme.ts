import { defineStyleConfig } from '@chakra-ui/react';
import { ComponentStyleConfig } from '@chakra-ui/react';

export const Link: ComponentStyleConfig = defineStyleConfig({
  baseStyle: props => {
    return {
      display: 'inline',
      color: props.color || 'link.color',
      textDecoration: 'none',
      svg: {
        color: 'currentColor',
      },

      '.child-string, .child-node, .child-node p': {
        width: '100%',
        display: 'inline',
        alignItems: 'baseline',
        color: 'inherit',
      },

      '.child-string, .child-node p': {
        borderBottom: props.borderBottom || '0.0625rem solid',
      },

      ':hover': {
        color: props?._hover?.color || 'link.color',
        textDecoration: 'none',

        '.child-string, .child-node, .child-node p': {
          borderBottomColor: 'transparent',
          color: 'inherit',
        },
      },

      ':visited': {
        color: props?._visited?.color || 'link.visited',
        '.child-string, .child-node, .child-node p, svg': {
          color: props?._visited?.color || 'link.visited',
        },

        ':hover': {
          borderBottom: 'transparent',
          '.child-string, .child-node, .child-node p': {
            borderBottomColor: 'transparent',
          },
        },
      },
    };
  },

  variants: {
    ghost: props => {
      return {
        borderBottomColor: 'transparent',
        '.child-string, .child-node, .child-node p': {
          color: 'inherit',
          borderBottomColor: 'transparent',
        },
        '.child-string, .child-node p': {
          borderBottomColor: 'transparent',
        },
        ':hover': {
          borderBottom: props.borderBottom || '0.0625rem solid',

          borderBottomColor: 'transparent',
          '.child-string, .child-node, .child-node p': {
            borderBottom: props.borderBottom || '0.0625rem solid',
            borderBottomColor: props.color || 'link.color',
          },
        },
        ':visited': {
          borderBottom: props.borderBottom || '0.0625rem solid',
          borderBottomColor: 'transparent',
          '.child-string, .child-node, .child-node p, svg': {
            borderBottom: props.borderBottom || '0.0625rem solid',
            borderBottomColor: 'transparent',
          },
          ':hover': {
            borderBottomColor: props?._visited?.color || 'link.visited',
            '.child-string, .child-node, .child-node p': {
              borderBottomColor: props?._visited?.color || 'link.visited',
            },
          },
        },
      };
    },
    unstyled: props => {
      return {
        '.child-string, .child-node p': {
          borderBottomColor: 'transparent',
        },
        ':hover': {
          color: props?._hover?.color || 'link.color',
          '.child-string, .child-node, .child-node p': {
            borderBottomColor: 'transparent',
            color: 'inherit',
          },
        },
        ':visited': {
          color: props?._visited?.color || 'link.visited',
          '.child-string, .child-node, .child-node p, svg': {
            color: props?._visited?.color || 'link.visited',
          },

          ':hover': {
            borderBottom: 'transparent',
            color: props?._visited?._hover?.color || 'link.visited',

            '.child-string, .child-node, .child-node p, svg': {
              borderBottomColor: 'transparent',
              color: 'inherit',
            },
          },
        },
      };
    },
  },
});

// Optional different link theme with text decoration instead of border-bottom.
// NIAID Digital Policies prefers border-bottom for links but it can be head-achy.
// export const Link = defineStyleConfig({
//   baseStyle: props => {
//     return {
//       display: 'inline',
//       color: props.color || 'link.color',
//       textDecoration: 'none',
//       svg: {
//         color: 'currentColor',
//       },

//       ':hover': {
//         color: props?._hover?.color || 'link.color',
//         textDecoration: 'underline',
//       },

//       ':visited': {
//         color: props?._visited?.color || 'link.visited',
//         svg: {
//           color: props?._visited?.color || 'link.visited',
//         },
//       },
//     };
//   },
//   variants: {
//     underline: props => {
//       return {
//         display: 'inline',
//         color: props.color || 'link.color',
//         textDecoration: 'underline',
//         svg: {
//           color: 'currentColor',
//         },

//         ':hover': {
//           color: props?._hover?.color || 'link.color',
//           textDecoration: 'none',
//         },

//         ':visited': {
//           color: props?._visited?.color || 'link.visited',
//           svg: {
//             color: props?._visited?.color || 'link.visited',
//           },
//         },
//       };
//     },
//     ghost: props => {
//       return {
//         borderBottomColor: 'transparent',
//         '.child-string, .child-node, .child-node p': {
//           color: 'inherit',
//           borderBottomColor: 'transparent',
//         },
//         '.child-string, .child-node p': {
//           borderBottomColor: 'transparent',
//         },
//         ':hover': {
//           borderBottom: props.borderBottom || '0.0625rem solid',

//           borderBottomColor: 'transparent',
//           '.child-string, .child-node, .child-node p': {
//             borderBottom: props.borderBottom || '0.0625rem solid',
//             borderBottomColor: props.color || 'link.color',
//           },
//         },
//         ':visited': {
//           borderBottom: props.borderBottom || '0.0625rem solid',
//           borderBottomColor: 'transparent',
//           '.child-string, .child-node, .child-node p, svg': {
//             borderBottom: props.borderBottom || '0.0625rem solid',
//             borderBottomColor: 'transparent',
//           },
//           ':hover': {
//             borderBottomColor: props?._visited?.color || 'link.visited',
//             '.child-string, .child-node, .child-node p': {
//               borderBottomColor: props?._visited?.color || 'link.visited',
//             },
//           },
//         },
//       };
//     },
//     unstyled: props => {
//       return {
//         display: 'inline',
//         color: props.color || 'link.color',
//         textDecoration: 'none',
//         svg: {
//           color: 'currentColor',
//         },

//         ':hover': {
//           color: props?._hover?.color || 'link.color',
//           textDecoration: 'none',
//         },

//         ':visited': {
//           color: props?._visited?.color || 'link.visited',
//           svg: {
//             color: props?._visited?.color || 'link.visited',
//           },
//         },
//       };
//     },
//   },
//   defaultProps: { variant: 'underline' },
// });
