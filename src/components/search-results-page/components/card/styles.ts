import {Box, BoxProps} from 'nde-design-system';
import styled from '@emotion/styled';

export const StyledTitle = styled(Box)<BoxProps>(() => ({}));
StyledTitle.defaultProps = {
  bg: 'primary.100',
  w: '100%',
  borderLeft: '4px',
  borderColor: 'primary.500',
};
