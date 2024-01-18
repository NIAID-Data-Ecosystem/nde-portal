import { Badge, Box, BoxProps } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const StyledBadge = styled(Badge)<BoxProps>(props => ({}));

StyledBadge.defaultProps = {
  variant: 'outline',
  border: '1px',
  borderRadius: '20px',
  px: 4,
  display: 'flex',
  alignItems: 'center',
};
