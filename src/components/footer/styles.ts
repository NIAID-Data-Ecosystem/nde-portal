import {Link, LinkProps} from '@chakra-ui/react';
import styled from '@emotion/styled';

export const StyledLink = styled(Link)<LinkProps>(() => ({}));

StyledLink.defaultProps = {
  display: 'inline',
  color: 'whiteAlpha.800',
  width: '100%',
  _visited: {color: 'white'},
  _hover: {color: 'white'},
};
