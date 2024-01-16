export const Card = {
  bg: 'white',
  boxShadow: 'base',
  borderRadius: 'semi',
  overflow: 'hidden',
  '>*': {
    p: [6, 8, 10],
  },
};

export const CardHeader = {
  pb: [2, 4],
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const CardBody = {
  display: 'flex',
  flexDirection: 'column',
  pt: 0,
  '>*': {
    my: 4,
  },
  _notLast: {
    pb: 0,
  },
  _last: {
    '>*': {
      _last: { mb: 0 },
    },
  },
};

export const CardFooter = {
  display: 'flex',
};

const baseStyle = {
  container: Card,
  header: CardHeader,
  body: CardBody,
  footer: CardFooter,
};

const variants = {
  colorful: {
    container: {},
    header: { bg: 'niaid.color', color: 'white' },
    footer: { bg: 'page.alt' },
  },
};

export default {
  parts: Object.keys(baseStyle),
  baseStyle,
  variants,
  defaultProps: {},
};
