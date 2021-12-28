import {Box, BoxProps} from '@chakra-ui/react';
import styled from '@emotion/styled';

export const StyledLabel = styled(Box)<BoxProps>``;

StyledLabel.defaultProps = {
  bg: 'nde.accent.bg',
  m: 1,
  px: 3,
  borderRadius: '20px',
  fontWeight: 'bold',
};
