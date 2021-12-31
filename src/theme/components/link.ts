const Link = {
  baseStyle: (props: any) => {
    return {
      display: 'inline-flex',
      alignItems: 'baseline',
      color: props.color || 'nde.link.bg',
      lineHeight: 'base',
      // using border instead of text-decoration as outlined here: https://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/link-styles
      borderBottom: '0.0625rem solid',
      textDecoration: 'none',

      borderColor: 'transparent',
      _hover: {textDecoration: 'none'},

      ':hover, :visited:hover': {
        textDecoration: 'none',
        borderBottom: '0.0625rem solid',
        borderColor: props?._hover?.color || 'niaid.600',
        color: props?._hover?.color || 'niaid.600',
        svg: {
          color: props?._hover?.color || 'niaid.600',
        },
      },
      ':visited': {
        color: props?._visited?.color ?? 'nde.link.visited',
        borderColor: props?._visited?.color ?? 'nde.link.visited',
        svg: {
          color: props?._visited?.color ?? 'nde.link.visited',
        },
      },
    };
  },
  variants: {
    underline: (props: any) => {
      return {
        borderColor: props.color || 'nde.link.bg',
        ':hover': {
          borderColor: 'transparent',
          textDecoration: 'none',
        },
      };
    },
    'no-line': {
      borderBottom: 'none',
      textDecoration: 'none',
      _hover: {textDecoration: 'none', borderBottom: 'none'},
      ':hover, :visited:hover': {
        textDecoration: 'none',
        borderBottom: 'none',
      },
      ':visited': {
        textDecoration: 'none',
        borderBottom: 'none',
      },
    },
  },
};

export default Link;
