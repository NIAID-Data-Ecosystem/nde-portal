const Card = {
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  variants: {
    smooth: {
      borderRadius: 'base',
      boxShadow: 'md',
      overflow: 'hidden',
    },
  },
  // The default variant value
  defaultProps: {
    variant: 'smooth',
  },
};

export default Card;
