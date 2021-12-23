import {Box, BoxProps} from '@chakra-ui/react';
import styled from '@emotion/styled';

export const StyledSection = styled(Box)<BoxProps>(() => ({}));
StyledSection.defaultProps = {
  my: 2,
  p: [6, 10],
  boxShadow: 'base',
  borderRadius: 'sm',
  bg: 'white',
  width: '100%',
};
