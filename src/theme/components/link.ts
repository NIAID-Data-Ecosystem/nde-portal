const Link = {
  parts: ['text'],
  baseStyle: {
    color: 'nde.link.bg',
    // borderBottom: '0.0625rem solid',
    // borderColor: 'gray.700',
    textDecoration: 'underline',
    lineHeight: 'base',
    svg: {
      color: 'nde.link.bg',
    },
    _hover: {
      textDecoration: 'none',
      borderColor: 'transparent',
    },
    _visited: {
      color: 'nde.link.visited',
      svg: {
        color: 'nde.link.visited',
      },
    },
  },
  variants: {
    title: {
      fontWeight: 'extrabold',
      fontFamily: 'heading',
      color: 'text.heading',
      _visited: {
        color: 'nde.link.visited',
      },
    },
  },
};

export default Link;
