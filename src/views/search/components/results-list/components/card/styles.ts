import { Box, BoxProps } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const StyledTitle = styled(Box)<BoxProps>(() => ({}));
StyledTitle.defaultProps = {
  bg: 'primary.100',
  w: '100%',
  borderLeft: '4px',
  borderColor: 'primary.500',
};
