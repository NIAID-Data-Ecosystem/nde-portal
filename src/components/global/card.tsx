import {Box, BoxProps, useStyleConfig} from '@chakra-ui/react';

interface CardProps extends BoxProps {
  variant?: string;
}

const Card: React.FC<CardProps> = props => {
  const {variant, children, ...rest} = props;

  // Get computed styles from theme.
  const styles = useStyleConfig('Card', {variant});

  // Pass the computed styles into the `__css` prop
  return (
    <Box
      __css={styles}
      sx={{
        gap: 0,
        '> *': {
          padding: [2, 4, 6],
          ...rest,
        },
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Card;
