import {
  Box,
  BoxProps,
  ButtonGroup,
  ButtonGroupProps,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  keyframes,
  Text,
  TextProps,
} from 'nde-design-system';
import styled from '@emotion/styled';

// Styles for the home page
export const fade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
`;

export const StyledSection = styled(Flex)<FlexProps>(props => ({}));

StyledSection.defaultProps = {
  as: 'section',
  w: '100%',
  px: [2, 4, 6],
  py: [2, 4, 8],
  flexWrap: ['wrap', 'wrap', 'nowrap'],
  flexDirection: ['column', 'column', 'row'],
  alignItems: ['flex-start', 'center', 'center'],
  justifyContent: ['center', 'center', 'center', 'space-between'],
  maxWidth: ['100%', '100%', '1280px'],
};

export const StyledSectionHeading = styled(Heading)<HeadingProps>(
  props => ({}),
);

StyledSectionHeading.defaultProps = {
  as: 'h2',
  color: 'text.body',
  fontWeight: 'regular',
};

export const StyledText = styled(Text)<TextProps>(props => ({}));

StyledText.defaultProps = {
  mt: 4,
  fontSize: ['lg'],
  fontWeight: 'light',
  lineHeight: 'short',
};

export const StyledBody = styled(Box)<BoxProps>(props => ({}));

StyledBody.defaultProps = {
  maxWidth: ['unset', 'unset', '410px'],
  textAlign: ['flex-start', 'center', 'flex-start'],
};

export const StyledSectionButtonGroup = styled(ButtonGroup)<ButtonGroupProps>(
  props => ({}),
);

StyledSectionButtonGroup.defaultProps = {
  flexWrap: ['wrap', 'nowrap'],
  my: [6, 6],
  spacing: [0, 4],
  w: '100%',
  justifyContent: ['flex-start', 'center', 'flex-start'],
  // max size for buttons in button group
  sx: {a: {maxWidth: 300}},
};
