import { ComponentStyleConfig } from '@chakra-ui/react';

export const Link: ComponentStyleConfig = {
  baseStyle: props => {
    return {
      display: 'inline',
      color: props.color || 'link.color',
      textDecoration: 'none',
      svg: {
        color: 'currentColor',
      },

      ':hover': {
        color: props?._hover?.color || 'link.color',
        textDecoration: 'underline',
      },

      ':visited': {
        color: props?._visited?.color || 'link.visited',
        svg: {
          color: props?._visited?.color || 'link.visited',
        },
      },
    };
  },
  variants: {
    underline: props => {
      return {
        display: 'inline',
        color: props.color || 'link.color',
        textDecoration: 'underline',
        svg: {
          color: 'currentColor',
        },

        ':hover': {
          color: props?._hover?.color || 'link.color',
          textDecoration: 'none',
        },

        ':visited': {
          color: props?._visited?.color || 'link.visited',
          svg: {
            color: props?._visited?.color || 'link.visited',
          },
        },
      };
    },
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
        display: 'inline',
        color: props.color || 'link.color',
        textDecoration: 'none',
        svg: {
          color: 'currentColor',
        },

        ':hover': {
          color: props?._hover?.color || 'link.color',
          textDecoration: 'none',
        },

        ':visited': {
          color: props?._visited?.color || 'link.visited',
          svg: {
            color: props?._visited?.color || 'link.visited',
          },
        },
      };
    },
  },
  defaultProps: { variant: 'underline' },
};
