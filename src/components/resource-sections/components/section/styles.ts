import { Box, BoxProps, Heading, HeadingProps } from 'nde-design-system';
import styled from '@emotion/styled';

export const StyledSectionHead = styled(Box)<BoxProps>(props => ({}));

StyledSectionHead.defaultProps = {
  bg: 'page.alt',
  py: 2,
};

export const StyledSectionHeading = styled(Heading)<HeadingProps>(
  props => ({}),
);

StyledSectionHeading.defaultProps = {
  fontFamily: 'body',
  as: 'h3',
  size: 'sm',
};
